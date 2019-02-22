// daily summerize
interface DailySummerize {
  cost: number,
  date: Date_YYYYMMDD,
  earn: number
}

interface NgxChartNode {
  name: string,
  value: number
}

interface NgxChartLineChartData {
  name: string,
  series: NgxChartNode[]
}

interface SummerizeDataToLineChart {
  cost: NgxChartLineChartData,
  earn: NgxChartLineChartData,
  sum: NgxChartLineChartData
}

type SummerizeCurrenyNode = {
  [cid: string]: {
    count: number,
    priceCost: number,
    priceEarn: number,
  }
}

interface SummerizeTypesCurrenyNode {
  [tid: string]: SummerizeCurrenyNode
}

interface SummerizeByType {
  sum: {
    count: number,
    priceCost: number,
    priceEarn: number,
    sum: number
  },
  total: SummerizeCurrenyNode,
  typeNone: SummerizeCurrenyNode,
  types: SummerizeTypesCurrenyNode
}