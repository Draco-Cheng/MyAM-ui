import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { RecordsService } from '../../../service/records.service';

import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}

@Component({
  selector: 'records-content',
  templateUrl: './records.add.template.html',
  styleUrls: ['../records.style.less', './records.add.style.less'],
  providers: [
    RecordsService,
    TypeService,
    CurrencyService
  ]
})

export class RecordsAddComponent implements OnInit {
  public __isInit = false;
  private __meta = {};

  public records: RecordNode[];
  private types: TypeNode[];
  private typesFlat: TypeFlat = {};
  private typesMapFlat: TypeMapFlat = null;
  private loading = false;

  private newRecord: RecordNode = {
    rid: null,
    cashType: -1,
    value: 0,
    tids: {},
    memo: '',
    date: formatDate(Date.now()),
    cid: '',
    tidsObjMap: null
  };

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getRecord();
    await this.getTypes();
    this.newRecord.cid = <string>this.currencyService.getDefaultCid();
    this.__isInit = true;
  }

  async __checkDataUpToDate(): Promise<void> {
    if (this.__meta['types']['legacy']) {
      await this.getTypes();
    }
  }

  async getRecord(): Promise<void> {
    this.__meta['records'] = await this.recordsService.get();
    this.records = this.__meta['records']['data'];
  }

  async getTypes(): Promise<void> {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];
    this.types.forEach((element: TypeNode): void => {
      this.typesFlat[element.tid] = element;
    });
  }

  async addRecord(): Promise<void> {
    const _record = _.cloneDeep(this.newRecord);
    const _resault = await this.recordsService.set(_record);

    if (!_resault.success) {
      return;
    }

    _record.rid = _resault['data'][0].rid;
    await this.recordsService.setType(_record.rid, Object.keys(_record.tids));

    if (_resault) {
      const _map = {};
      _record.tidsObjMap = <TypeFlatMap>_record.tids;
      _record.tids = Object.keys(_record.tids);

      this.records.unshift(_record);

      this.newRecord.value = 0;
      this.newRecord.tids = {};
      this.newRecord.memo = '';
    }
  }

  submitNewRecord(): void {
    this.loading = true;
    this.addRecord()
      .then(() => this.loading = false);
  }

  tidToLabel(tid: Tid): string {
    return this.typesFlat[tid].type_label;
  }

  removeTypeInRecord(tid: Tid): void {
    delete this.newRecord.tids[tid];
  }

  getRecordTypeMapSwitch(): (tid: Tid) => void {
    return (tid: Tid): void => {
      if (this.newRecord.tids[tid]) {
        delete this.newRecord.tids[tid];
      } else {
        this.newRecord.tids[tid] = true;
      }
    };
  }

  getRecordTidsArr(): Tid[] {
    return Object.keys(this.newRecord.tids);
  }

  getSelectionCallback(record: RecordNode): (cid: Cid) => void {
    return (cid: Cid): void => {
      record.cid = cid;
    };
  }
}
