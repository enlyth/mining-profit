import React, { Component } from 'react'
import electricityPrices from '../data/electricity.js'
import ReactTooltip from 'react-tooltip'
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography
} from 'react-simple-maps'

export default class WorldMap extends Component {
  constructor () {
    super()
    this.state = {
      tooltipData: {
        content: <p>Loading...</p>
      }
    }
    this.handleMove = this.handleMove.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
  }

  componentDidMount () {
    setTimeout(() => {
      ReactTooltip.rebuild()
    }, 100)
  }

  handleMove (geography, evt) {
    this.setState({
      tooltipData: { content: geography.properties.name, visible: true }
    })
  }

  handleLeave () {
    this.setState({
      tooltipData: {
        visible: false
      }
    })
  }

  /**
   * Re-render map only on equip change
   * Will be deprecated for getDerivedStateFromProps?
   */

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.equip !== this.props.equip) {
      return true
    } else {
      return false
    }
  }

  findCoinByTag (tag) {
    for (const [key, obj] of Object.entries(this.props.coinData)) {
      if (obj.tag === tag) {
        return this.props.coinData[key]
      }
    }
    return null
  }

  getGeographyTooltip (geography) {
    const countryTag = geography.id
    const countryName = geography.properties.name
    const profitability = this.props.profitCountryData[countryTag]
    const price = profitability ? profitability.oneHourProfitUSD : 0.0
    return `<div><strong>${countryName}</strong><br/>${
      profitability && profitability.ratio
        ? `${'$' + electricityPrices[geography.id] + ' per KWh'}` +
          '<hr />Hour: $' +
          price.toFixed(2) +
          '<br/>Day: $' +
          (price * 24).toFixed(2) +
          '<br/>Week: $' +
          (price * 24 * 7).toFixed(2) +
          '<br/>Month: $' +
          (price * 24 * 30).toFixed(2) +
          '<br/>Year: $' +
          (price * 24 * 365.25).toFixed(2)
        : ''
    }</div>`
  }

  render () {
    return (
      <div id="outer-container">
        <ComposableMap
          projectionConfig={{
            scale: 205,
            rotation: [-11, 0, 0]
          }}
          width={980}
          height={551}
          style={{
            width: '100%',
            height: 'auto'
          }}
        >
          <ZoomableGroup center={[0, 20]} disablePanning>
            <Geographies
              geography="/static/110m.json"
              disableOptimization={true}
              ref="geographies"
            >
              {(geographies, projection) =>
                geographies.map((geography, i) => {
                  let color = '#333'
                  let profit = 0.0
                  let profitability = null

                  if (geography.id in electricityPrices) {
                    profitability = this.props.profitCountryData[geography.id]
                    if (profitability === null) {
                      return <div />
                    }
                    profit = profitability.ratio

                    if (profit) {
                      if (profit < 1.0) {
                        color = '#ff0054'
                      } else {
                        color = '#3564ff'
                      }
                    }
                  }
                  const style = {
                    fill: color,
                    stroke: '#444',
                    strokeWidth: 0.75,
                    outline: 'none'
                  }
                  return (
                    <Geography
                      data-tip={this.getGeographyTooltip(
                        geography,
                        profitability
                      )}
                      data-html
                      onMouseMove={this.handleMove}
                      onMouseLeave={this.handleLeave}
                      key={i}
                      cacheId={`geography-${i}`}
                      geography={geography}
                      projection={projection}
                      style={{
                        default: style,
                        hover: style,
                        pressed: style
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        <ReactTooltip html className="tooltip-theme" />
      </div>
    )
  }
}
