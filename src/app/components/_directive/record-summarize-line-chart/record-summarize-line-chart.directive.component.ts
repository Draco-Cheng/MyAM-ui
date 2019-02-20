import { Component, Input, Output, OnInit } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { SummarizeService } from '../../../service/summarize.service';

import { NgxLineChartConf } from './ngx-line-chart-conf';

type GetDaySummerize = () => DailySummerize[];

@Component({
  selector: '[record-summarize-line-chart]',
  templateUrl: './record-summarize-line-chart.template.html',
  styleUrls: ['./record-summarize-line-chart.style.less'],
  providers: [
    RecordsService,
    SummarizeService
  ]
})

export class RecordSummarizeLineChartDirectiveComponent implements OnInit {
  @Input() getDaySummerize: GetDaySummerize;

  public __isInit = false;
  private __meta = {};

  private lineChartSelected = '';
  private daySummerize: DailySummerize[];
  private summerizeForLineChartObj: SummerizeDataToLineChart;
  private summerizeForLineChart: NgxLineChartConf;

  constructor(
    private summarizeService: SummarizeService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.buildSummerize();
    this.__isInit = true;
  }

  async buildSummerize(): Promise<void> {
    this.daySummerize = this.getDaySummerize();
    await this.buildLineChartData(this.daySummerize);
  }

  async buildLineChartData(summerize: DailySummerize[]): Promise<void> {
    summerize = summerize || this.daySummerize;
    this.summerizeForLineChartObj = await this.summarizeService.daySummerizeToLineChart(summerize);
    this.renderLineChart();
  }

  renderLineChart(): void {
    switch (this.lineChartSelected) {
      case '':
        this.summerizeForLineChart = new NgxLineChartConf([this.summerizeForLineChartObj.cost, this.summerizeForLineChartObj.earn]);
        break;
      case 'SUM':
        this.summerizeForLineChart = new NgxLineChartConf([this.summerizeForLineChartObj.sum]);
        break;
    }
  }

  onSelect(): void {
    this.renderLineChart();
  }
}
