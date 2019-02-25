import { Component, Input, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { TypeService, ChildsList } from '../../../service/type.service';
import { SummarizeService } from '../../../service/summarize.service';

import { NgxPieChartConf } from './ngx-pie-chart-conf';

type GetTypeSummerize = () => SummerizeByType;

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
  @Input() getTypeSummerize: GetTypeSummerize;

  public __isInit = false;
  private __meta = {};
  private typesMapFlat: TypeMapFlat;

  private typeIdSelected = 'OVERVIEW';
  private typeSummerize: SummerizeByType;
  public typeSummerizeForPieChart: NgxPieChartConf;
  public sumTidsHasChilds: Tid[];

  constructor(
    private typeService: TypeService,
    private summarizeService: SummarizeService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getTypes();
    await this.buildSummerize();
    this.__isInit = true;
  }

  async getTypes(): Promise<void> {
    this.typesMapFlat = (await this.typeService.getFlatMap())['data'];
  }

  async buildSummerize(): Promise<void> {
    this.typeSummerize = this.getTypeSummerize();

    await this.buildPieChartData(this.typeSummerize);

    this.typeIdSelected = 'OVERVIEW';
    this.sumTidsHasChilds = await this.getSumTidsHasChilds(this.typeSummerize);
  }

  getSumTidsHasChilds(summerize: SummerizeByType): Tid[] {
    summerize = summerize || this.typeSummerize;
    const typesMapFlat = this.typesMapFlat;

    const sumTypeIds = Object.keys(summerize['types']);
    const sumTypeParentTidsFlat = {};

    sumTypeIds.forEach((tid: Tid) => {
      !!typesMapFlat[tid] && Object.assign(sumTypeParentTidsFlat, typesMapFlat[tid]['parents']);
    });

    return Object.keys(sumTypeParentTidsFlat);

  }

  async buildPieChartData(summerize?: SummerizeByType): Promise<void> {
    summerize = summerize || this.typeSummerize;


    let typeListChild: Tid[];
    let typeListUnclassified: Tid[];
    let childsList: ChildsList;
    let showTypeNone: boolean;
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
        childsList = await this.typeService.getChildsInNextLayer(this.typeIdSelected, true);
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

  tidToLabel(tid: Tid): string {
    return this.typeService.tidToLable(tid);
  }

  onSelectTid(): void {
    this.buildPieChartData();
  }
}
