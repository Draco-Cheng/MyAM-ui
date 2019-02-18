import { Component, Input, Output, OnInit } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { SummarizeService } from '../../../service/summarize.service';

import { NgxLineChartConf } from './ngx-line-chart-conf';

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
  @Input() getDaySummerize: Function;

  public __isInit = false;
  private __meta = {};

  private lineChartSelected = '';
  private daySummerize;
  private summerizeForLineChartObj;
  private summerizeForLineChart;

  constructor(
    private summarizeService: SummarizeService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.buildSummerize();
    this.__isInit = true;
  }


  async buildSummerize() {

    this.daySummerize = this.getDaySummerize();
    await this.buildLineChartData(this.daySummerize);
  }

  async buildLineChartData(summerize) {
    summerize = summerize || this.daySummerize;
    this.summerizeForLineChartObj = await this.summarizeService.daySummerizeToLineChart(summerize);
    this.renderLineChart();
  }

  renderLineChart() {
    switch (this.lineChartSelected) {
      case '':
        this.summerizeForLineChart = new NgxLineChartConf([this.summerizeForLineChartObj['Cost'], this.summerizeForLineChartObj['Earn']]);
        break;
      case 'SUM':
        this.summerizeForLineChart = new NgxLineChartConf([this.summerizeForLineChartObj['Sum']]);
        break;
    }
  }

  onSelect() {
    this.renderLineChart();
  }
}
