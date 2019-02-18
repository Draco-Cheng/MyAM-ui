import { Component, Input, Output, OnInit } from '@angular/core';

import { TypeService } from '../../../service/type.service';
import { SummarizeService } from '../../../service/summarize.service';

import { NgxPieChartConf } from './ngx-pie-chart-conf';

@Component({
  selector: '[record-summarize-type-pie-chart]',
  templateUrl: './record-summarize-type-pie-chart.template.html',
  styleUrls: ['./record-summarize-type-pie-chart.style.less'],
  providers: [
    TypeService,
    SummarizeService
  ]
})

export class RecordSummarizeTypePieChartDirectiveComponent implements OnInit {
  @Input() getTypeSummerize: Function;

  public __isInit = false;
  private __meta = {};
  private typesMapFlat;

  private typePiChart;
  private typeIdSelected = 'OVERVIEW';
  private typeSummerize;
  private typeSummerizeForPieChart;
  private sumTidsHasChilds;

  constructor(
    private typeService: TypeService,
    private summarizeService: SummarizeService,
  ) { }

  async ngOnInit() {
    await this.getTypes();
    await this.buildSummerize();
    this.__isInit = true;
  }

  async getTypes() {
    this.typesMapFlat = (await this.typeService.getFlatMap())['data'];
  }

  async buildSummerize() {
    const _typeIdsForChart = [];

    this.typeSummerize = this.getTypeSummerize();

    await this.buildPieChartData(this.typeSummerize);

    this.typeIdSelected = 'OVERVIEW';
    this.sumTidsHasChilds = await this.getSumTidsHasChilds(this.typeSummerize);
  }

  async getSumTidsHasChilds(summerize) {
    summerize = summerize || this.typeSummerize;
    const typesMapFlat = this.typesMapFlat;

    const sumTypeIds = Object.keys(summerize['types']);
    const sumTypeParentTidsFlat = {};

    sumTypeIds.forEach(tid => {
      !!typesMapFlat[tid] && Object.assign(sumTypeParentTidsFlat, typesMapFlat[tid]['parents']);
    });

    return Object.keys(sumTypeParentTidsFlat);

  }

  async buildPieChartData(summerize?) {
    summerize = summerize || this.typeSummerize;


    let typeListChild;
    let typeListUnclassified;
    let childsList;
    let showTypeNone;
    switch (this.typeIdSelected) {
      case 'OVERVIEW':
        childsList = await this.typeService.getChildsInNextLayer(null, true);
        typeListChild = childsList['childs'];
        typeListUnclassified = childsList['unclassified'];
        showTypeNone = true;
        break;
      case 'UNCLASSIFIED_TYPE':
        childsList = await this.typeService.getChildsInNextLayer(null, true);
        typeListChild = childsList['unclassified'];
        break;
      default:
        childsList = await this.typeService.getChildsInNextLayer(parseInt(this.typeIdSelected, 10), true);
        typeListChild = childsList['childs'];
        break;
    }

    const _pieCharData = await this.summarizeService.typeSummerizeToPieChart(
      summerize,
      typeListChild,
      typeListUnclassified,
      showTypeNone);
    this.typeSummerizeForPieChart = new NgxPieChartConf(_pieCharData);
  }

  tidToLabel(tid) {
    return this.typeService.tidToLable(tid);
  }

  onSelectTid() {
    this.buildPieChartData();
  }
}
