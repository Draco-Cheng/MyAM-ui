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