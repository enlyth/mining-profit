/**
 * This is far from complete and accurate at the moment.
 *
 * These are very hard to get accurately. Prices vary even accours countries significantly, and for some massive ones like USA, it's almost impossible to get an estimate.
 * I tried going for the lower bound most of the time, and sources include:
 *
 * https://en.wikipedia.org/wiki/Electricity_pricing
 * https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/647362/International_Energy_Price_Comparisons_September_2017.pdf
 * https://www.statista.com/statistics/263492/electricity-prices-in-selected-countries/
 * https://www.ovoenergy.com/guides/energy-guides/average-electricity-prices-kwh.html
 *
 * And others.
 *
 * Three letter country codes:
 * http://www.nationsonline.org/oneworld/country_code_list.htm
 *
 * Remember, the 110m JSON country data doesn't include many countries which are too small.
 */

const electricityPricesUSDPerKWh = {
  DNK: 0.35,
  NOR: 0.19,
  ISR: 0.11,
  PRT: 0.25,
  DEU: 0.33,
  ESP: 0.30,
  AUS: 0.29,
  JPN: 0.26,
  GBR: 0.17,
  FRA: 0.19,
  BRA: 0.17,
  USA: 0.12,
  RUS: 0.11,
  CAN: 0.10,
  CHN: 0.08,
  IND: 0.08,
  ITA: 0.28,
  MEX: 0.10,
  FIN: 0.18,
  SWE: 0.23,
  ISL: 0.17,
  ZAF: 0.09,
  BEL: 0.26,
  CZE: 0.15,
  SVK: 0.18,
  POL: 0.17,
  AUT: 0.22,
  NLD: 0.20,
  CHE: 0.25,
  KAZ: 0.08,
  MNG: 0.10
}

export default electricityPricesUSDPerKWh
