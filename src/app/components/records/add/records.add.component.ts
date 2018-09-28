import { Component } from '@angular/core';

import { RecordsService } from '../../../service/records.service';

import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};

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

export class RecordsAddComponent {
  public __isInit = false;
  private __meta = {};

  public records;
  private types;
  private typesFlat = {};
  private typesMapFlat = null;
  private loading = false;

  private newRecord = {
    cashType: -1,
    value: 0,
    tids: {},
    memo: '',
    date: formatDate(Date.now()),
    cid: ''
  };

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) { };

  async ngOnInit() {
    await this.getRecord();
    await this.getTypes();
    this.newRecord.cid = this.currencyService.getDefaultCid();
    this.__isInit = true;
  };

  async __checkDataUpToDate() {
    if (this.__meta['types']['legacy']) {
      await this.getTypes();
    }
  }

  async getRecord() {
    this.__meta['records'] = await this.recordsService.get();
    this.records = this.__meta['records']['data'];
  };

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];
    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  };

  async addRecord() {
    let _record = cloneObj(this.newRecord);
    const _resault = await this.recordsService.set(_record);

    if (!_resault.success) return;

    _record.rid = _resault['data'][0].rid;
    const _resault2 = await this.recordsService.setType(_record.rid, Object.keys(_record.tids));

    if (_resault) {
      let _map = {};
      _record.tidsObjMap = _record.tids;
      _record.tids = Object.keys(_record.tids);

      this.records.unshift(_record);

      this.newRecord.value = 0;
      this.newRecord.tids = {};
      this.newRecord.memo = '';
    }
  };

  submitNewRecord() {
    this.loading = true;
    this.addRecord()
      .then(() => this.loading = false);
  }

  async currencyExchange(records) {
    // for(let record of records){
    //   record.currencyExhange = await this.currencyService.exchange(record.cid, this.defaultCid, record.value);
    // }    
  }

  tidToLabel(tid: string) {
    return this.typesFlat[tid].type_label;
  }

  removeTypeInRecord(tid) {
    delete this.newRecord.tids[tid];
  }

  getRecordTypeMapSwitch(record) {
    let _self = this;
    return (tid) => {
      if (this.newRecord.tids[tid])
        delete this.newRecord.tids[tid];
      else
        this.newRecord.tids[tid] = true;;
    };
  }

  getRecordTidsArr() {
    return Object.keys(this.newRecord.tids);
  }

  getSelectionCallback(record) {
    return cid => {
      record.cid = cid;
    }
  }
}
