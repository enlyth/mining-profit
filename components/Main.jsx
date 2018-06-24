import React, { Component } from 'react'
import BurgerMenu from 'react-burger-menu'
import electricityPrices from '../data/electricity.js'
import fetch from 'isomorphic-unfetch'
import WorldMap from '../components/WorldMap'
import { toSIString } from '../functions/util'

export default class Main extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filter: '',
      menuOptions: [<h2>Loading...</h2>],
      priceData: null,
      equipData: null,
      selectedEquip: null,
      menuOpen: false,
      hideUnprofitable: false,
      isReady: false,
      profitability: null,
      apiFailure: false
    }
  }

  fetchInitialData () {
    /**
     * This is a pretty lazy CORS workaround, not sure why the current server.js does not fix the CORS issues
     */
    const apiRequests = [
      fetch('https://cors.now.sh/https://whattomine.com/asic.json'),
      fetch('https://cors.now.sh/https://whattomine.com/coins.json'),
      fetch('https://cors.now.sh/https://www.cryptocompare.com/api/data/miningequipment/')
    ]

    /**
     * Not ideal, I've opted to store the JSON data
     * directly into the main component's state, as is.
     * It results in some not-so-pretty data transformations down the line.
     */
    Promise.all(apiRequests)
      .then(responses => {
        Promise.all(responses.map(res => res.json())).then(async jsonData => {
          const miningEquipment = jsonData[2]
          const coinData = { ...jsonData[0].coins, ...jsonData[1].coins }

          // Has science gone too far?
          const priceData = await (await fetch(
            `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${miningEquipment.SymbolsNeeded.toString()}&tsyms=USD`
          )).json()

          this.setState({
            symbolsNeeded: miningEquipment.SymbolsNeeded,
            coinData: coinData,
            equipData: miningEquipment.MiningData,
            priceData: priceData,
            isReady: true
          })
        })
      })
      .catch(err => {
        this.setState({
          apiFailure: true
        })
        return err
      })
  }

  componentDidMount () {
    console.log('Created in 2018 by enlyth (popik.boris@gmail.com)')
    this.fetchInitialData()
  }

  selectEquip (key) {
    this.setState({ selectedEquip: key })
  }

  onFilterChange (event) {
    this.setState({ filter: event.target.value })
  }

  findCoinByTag (tag) {
    for (const [key, obj] of Object.entries(this.state.coinData)) {
      if (obj.tag === tag) {
        return this.state.coinData[key]
      }
    }
    return null
  }

  getProfitability (countryCode, equip = this.getCurrentEquip()) {
    if (!equip || countryCode in electricityPrices === false) {
      return { ratio: 0.0 }
    }
    try {
      /**
       * This equation from some Bitcoin wiki is the backbone
       * of this whole thing. let's hope it's correct:
       *
       * time = difficulty * 2**32 / hashrate
       *
       * luckily, there are is no such thing as an integer in JS,
       * so we can safely assume this won't overflow
       */

      const currency = equip.CurrenciesAvailable
      const hashesPerSecond = equip.HashesPerSecond
      const coinPriceUSD = this.state.priceData[currency].USD
      const coin = this.findCoinByTag(currency)
      const wattage = equip.PowerConsumption

      const secondsToBlock = coin.difficulty * 2 ** 32 / hashesPerSecond
      const hoursToOneUnit = secondsToBlock / coin.block_reward / 3600
      const electricityBurnUSD =
        wattage / 1e3 * electricityPrices[countryCode] * hoursToOneUnit
      if (Number.isNaN(electricityBurnUSD)) {
        return { ratio: 0.0 }
      }

      const oneHourProfitUSD =
        coinPriceUSD / hoursToOneUnit -
        wattage / 1e3 * electricityPrices[countryCode]

      const ratio = coinPriceUSD / electricityBurnUSD

      return {
        ratio: ratio,
        coinPriceUSD: coinPriceUSD,
        electricityBurnUSD: electricityBurnUSD,
        oneHourProfitUSD: oneHourProfitUSD
      }
    } catch (err) {
      return { ratio: 0.0 }
    }
  }

  getProfitabilityAggregate (equip) {
    let profitableIn = 0
    for (const country in electricityPrices) {
      const profitRatio = this.getProfitability(country, equip).ratio
      if (profitRatio > 1.0) {
        ++profitableIn
      }
    }
    return profitableIn
  }

  getCurrentEquip () {
    return this.state.equipData
      ? this.state.equipData[this.state.selectedEquip]
      : null
  }

  clearFilter () {
    this.setState({ filter: '' })
  }

  toggleHideUnprofitable (event) {
    this.setState({
      hideUnprofitable: event.target.checked
    })
  }

  isMenuOpen (state) {
    this.setState({ menuOpen: state.isOpen })
  }

  getMenuOptions () {
    const compareEquipName = (a, b) => {
      if (a[0 + 1].Name.toLowerCase() < b[0 + 1].Name.toLowerCase()) {
        return -1
      }
      if (a[0 + 1].Name.toLowerCase() > b[0 + 1].Name.toLowerCase()) {
        return 1
      }
      return 0
    }

    return this.state.equipData
      ? [
        <h2 key={'options-heading'}>Options</h2>,
        <div key={'options-1'}>
          <form style={{ display: 'inline-block' }}>
            <label>
              <input
                type="text"
                className="input-text"
                name="name"
                value={this.state.filter}
                placeholder="Filter..."
                onChange={this.onFilterChange.bind(this)}
              />
            </label>
          </form>
          <button
            onClick={this.clearFilter.bind(this)}
            style={{ display: 'inline-block' }}
          >
              Clear
          </button>
        </div>,
        <div key={'options-0'}>
          <label className="checkboxContainer">
              Hide unprofitable
            <input
              type="checkbox"
              value={this.state.hideUnprofitable}
              checked={this.state.hideUnprofitable}
              onChange={this.toggleHideUnprofitable.bind(this)}
              name="hideUnprofitable"
            />
            <span className="checkmark" />
          </label>
        </div>,
        <h2 key={'equip-head'}>Equipment</h2>
      ].concat(
        Object.entries(this.state.equipData)
          .sort(compareEquipName)
          .filter(
            (item, i, arr) => i && item[0 + 1].Name !== arr[i - 1][0 + 1].Name
          )
          .map(([key, value]) => {
            const currentEntryProfitability = this.getProfitabilityAggregate(
              value
            )
            // console.log('value: ', value)
            if (
              this.state.hideUnprofitable &&
                currentEntryProfitability === 0
            ) {
              return null
            }
            return key === this.state.selectedEquip ? (
              <a
                className="menu-selected"
                key={key}
                href="javascript:void(0)"
              >
                {value.Name}{' '}
                <h3>
                  {value.Algorithm} ·{' '}
                  {toSIString(value.HashesPerSecond, 'H/s')} ·{' '}
                  {value.PowerConsumption}W<br />
                </h3>
                <span>
                    Profitable in {currentEntryProfitability} out of{' '}
                  {Object.keys(electricityPrices).length} countries
                </span>
              </a>
            ) : (
              (this.state.filter === ''
                ? true
                : value.Name.toLowerCase().includes(
                  this.state.filter.toLowerCase()
                )) && (
                <a
                  onClick={() => this.selectEquip(key)}
                  key={key}
                  href="javascript:void(0)"
                >
                  <div
                    className="mini-dot"
                    style={{
                      boxShadow: `inset 0px ${Math.trunc(
                        (1 -
                            currentEntryProfitability /
                              Object.keys(electricityPrices).length) *
                            12
                      ).toString()}px 0px 0px #333`
                    }}
                  />{' '}
                  {value.Name}
                </a>
              )
            )
          })
      )
      : [<h2 key={0}>Loading...</h2>]
  }

  render () {
    if (!this.state.isReady) {
      return (
        <div className="loading-api-data">
          <span>Fetching Data</span>
        </div>
      )
    } else if (this.state.apiFailure) {
      return (
        <div className="loading-api-data">
          <span>
            Failed to fetch data from APIs. Either the APIs have had updates
            with breaking changes, the developer is incompetent (likely), or
            something is wrong with your internet connection. Try refreshing
            this page, or trying again later.
          </span>
        </div>
      )
    }

    const equip = this.getCurrentEquip()
    const Menu = BurgerMenu['slide']

    return (
      <div>
        <Menu
          width={400}
          id={'slide'}
          onStateChange={this.isMenuOpen.bind(this)}
        >
          {this.getMenuOptions()}
        </Menu>

        <main>
          <h3 className="description">
            {this.state.priceData
              ? this.state.symbolsNeeded.map((val, idx) => (
                <span key={idx}>
                  {val}
                  {'\u00A0'}${this.state.priceData[val].USD}
                  {'\u00A0'}
                  {idx === this.state.symbolsNeeded.length - 1 ? '' : ' · '}
                </span>
              ))
              : 'Loading prices...'}
          </h3>
          <div>
            {equip ? (
              <div>
                <h1>{equip.Name}</h1>
              </div>
            ) : (
              <h1>Select equipment...</h1>
            )}
          </div>

          <WorldMap
            equipData={this.state.equipData}
            equip={this.state.selectedEquip}
            priceData={this.state.priceData}
            coinData={this.state.coinData}
            filter={this.state.filter}
            profitCountryData={Object.entries(electricityPrices)
              .map(([country, price]) => ({
                [country]: Object.assign(this.getProfitability(country), {
                  price: price
                })
              }))
              .reduce((acc, cur) => Object.assign(acc, cur), {})}
          />
        </main>
      </div>
    )
  }
}
