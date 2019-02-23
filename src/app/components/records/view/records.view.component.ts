import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';
import { SummarizeService } from '../../../service/summarize.service';

function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) { month = '0' + month; }
  if (day.length < 2) { day = '0' + day; }

  return [year, month, day].join('-');
}

// For performance issue move scroll binding out of component
// TODO: find a better solution for scrolling issue. Maybe try slick grid or angular material?
let __componentThis;

function onScroll(evt) {
  if (!__componentThis) { return; }
  if (__componentThis.records_pool.length <= __componentThis.records_index || __componentThis.records_index >= 500) { return; }

  const _target = evt['target']['scrollingElement'];
  if (_target.scrollHeight - (_target.scrollTop + window.innerHeight) <= 1) {
    __componentThis.showMoreBtn.nativeElement.click();
  }
}
window.onscroll = onScroll;

@Component({
  selector: 'records-content',
  templateUrl: './records.view.template.html',
  styleUrls: ['../records.style.less', './records.view.style.less'],
  providers: [
    RecordsService,
    TypeService,
    CurrencyService,
    SummarizeService
  ],

  /*
  host: {
    '(window:scroll)': 'onRecordScroll($event)'
  }
  */
})

export class RecordsViewComponent implements OnInit {
  public __isInit = false;
  private __meta = {};

  @ViewChild('showMoreBtn') showMoreBtn: ElementRef;
  @ViewChild('recordSummarizeTypeFlat') recordSummarizeTypeFlat: SummerizeChild;
  @ViewChild('recordSummarizeTypePieChart') recordSummarizeTypePieChart: SummerizeChild;
  @ViewChild('recordSummarizeLineChart') recordSummarizeLineChart: SummerizeChild;

  private loading = false;
  private records: RecordNode[];
  private records_pool: RecordNode[] = [];
  private records_push_number = 25;
  private records_index: number;

  private typeSummerize: SummerizeByType;
  private daySummerize: DailySummerize[];

  private showTypeMap;
  private qureyCondition: RecordQueryCondition = {
    cashType: 0,
    cid: null,
    start_date: formatDate(Date.now() - 1000 * 60 * 60 * 24 * 60),
    end_date: formatDate(Date.now()),
    tids_json: null,
    type_query_set: 'intersection',
    memo: null,
    value_greater: null,
    value_less: null,
    limit: '',
    orderBy: ['date', 'DESC']
  };

  qureyConditionTidsObj = {};

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private summarizeService: SummarizeService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getRecord();
    __componentThis = this;
    this.__isInit = true;
  }

  async getRecord(): Promise<void> {
    this.__meta['records'] = await this.recordsService.get(this.qureyCondition);
    this.records_pool = this.__meta['records']['data'] || [];
    this.records = [];
    this.records_index = 0;
    this.lazyPushRecords();

    await this.buildSummarize();
  }

  async buildSummarize() {
    this.typeSummerize = await this.summarizeService.buildTypeSummerize(this.records_pool);
    this.daySummerize = await this.summarizeService.buildDaySummerize(this.records_pool);
    this.recordSummarizeTypeFlat && this.recordSummarizeTypeFlat.buildSummerize();
    this.recordSummarizeTypePieChart && this.recordSummarizeTypePieChart.buildSummerize();
    this.recordSummarizeLineChart && this.recordSummarizeLineChart.buildSummerize();

  }

  lazyPushRecords(): void {
    this.records.push(...(this.records_pool.slice(this.records_index, this.records_index + this.records_push_number)));
    this.records_index = this.records_index + this.records_push_number;
  }

  getSelectionCallback = (cid: Cid): void => {
    this.qureyCondition.cid = cid;
  }

  getQureyConditionTidsArr(): { tid: Tid, label: string }[] {
    return _.map(this.qureyConditionTidsObj, (val: string, key: Tid) => {
      return { tid: key, label: val };
    });
  }

  conditionChange(): void {
    this.loading = true;
    this.buildQureyConditionTidsArr()
      .then(() => this.getRecord())
      .then(() => this.loading = false);
  }

  async buildQureyConditionTidsArr(): Promise<void> {
    const tidsList = Object.keys(this.qureyConditionTidsObj);
    const arr = [];

    for (let i = 0; i < tidsList.length; i++) {
      const list = await this.typeService.getAllChildsInTree(tidsList[i]);
      list.length || list.push(tidsList[i]);
      arr.push(list);
    }

    this.qureyCondition['tids_json'] = arr.length ? JSON.stringify(arr) : null;
  }

  typeMapCallback = async (tid: Tid, label: string): Promise<void> => {
    if (!tid) {
      this.showTypeMap = false;
      this.conditionChange();
      return;
    }

    if (this.qureyConditionTidsObj[tid]) {
      delete this.qureyConditionTidsObj[tid];
    } else {
      this.qureyConditionTidsObj[tid] = label;
    }
  }

  removeQureyConditionTids(tid: Tid): void {
    delete this.qureyConditionTidsObj[tid];
    this.conditionChange();
  }

  showMoreRecord(): void {
    this.lazyPushRecords();
  }

  scrollToTop(): void {
    document.scrollingElement.scrollTop = 0;
  }

  putTypeSummerizeToDirective = (): SummerizeByType => {
    return this.typeSummerize;
  }

  putDaySummerizeToDirective = (): DailySummerize[] => {
    return this.daySummerize;
  }
}
