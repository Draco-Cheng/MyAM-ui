import { Component, Input, OnInit } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

interface RecordTableItem extends RecordNode, IsChangeViewItem {
  currencyExhange: CurrencyExchangeItem;
}

@Component({
  selector: 'records-table',
  templateUrl: './record-table.template.html',
  styleUrls: ['../records.style.less', './record-table.style.less'],
  providers: [
    RecordsService,
    TypeService,
    CurrencyService
  ]
})

export class RecordTableDirectiveComponent implements OnInit {
  @Input() records: any;

  public __isInit = false;
  private __meta = {};

  private types: TypeNode[];
  private typesFlat: TypeFlat = {};

  private currencyFlatMap: CurrencyMap;
  private defaultCid: Cid;
  public defaultCurrencyType: CurrencyType;

  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getTypes();
    await this.getCurrency();
    this.__isInit = true;
  }
  async __checkDataUpToDate(): Promise<void> {
    if (this.__meta['types']['legacy']) {
      await this.getTypes();
    }
  }

  async getCurrency(): Promise<void> {
    // only check currency on initial ready
    const _currencyMap = await this.currencyService.getMap();
    this.currencyFlatMap = _currencyMap['data']['flatMap'];
    this.defaultCid = this.currencyService.getDefaultCid();
    this.defaultCurrencyType = this.cidToCtype(this.defaultCid);
  }

  async getTypes(): Promise<void> {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];

    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  }

  ObjKey(obj: object): string[] {
    return Object.keys(obj);
  }

  tidToLabel(tid: Tid): string {
    if (this.typesFlat[tid]) {
      return this.typesFlat[tid].type_label;
    }

    console.warn('Type missing', tid);
    return <string>tid;
  }

  cidToCtype(cid: Cid): CurrencyType {
    return this.currencyFlatMap[cid]['type'];
  }

  removeTypeInRecord(record: RecordTableItem, tid: Tid): void {
    delete record.tidsObjMap[tid];
    this.recordChange(record);
  }

  recordChange(record: RecordTableItem): void {
    record.isChange = true;
  }

  getRecordTypeMapSwitch(record: RecordTableItem): (tid: Tid) => void {
    const self = this;
    return (tid: Tid): void => {
      if (record.tidsObjMap[tid]) {
        delete record.tidsObjMap[tid];
      } else {
        record.tidsObjMap[tid] = true;
      }
      self.recordChange(record);
    };
  }

  getSelectionCallback(record: RecordTableItem): (cid: Cid) => void {
    return (cid: Cid): void => {
      record.cid = cid;
      this.recordChange(record);
    };
  }

  async saveRecord(record: RecordTableItem): Promise<void> {

    const _resault1 = await this.recordsService.set(record);
    const _resault2 = await this.recordsService.setType(record.rid, Object.keys(record.tidsObjMap));

    if (_resault1['data'] && _resault2['data']) {
      record.isChange = false;
    }
  }

  async delRecord(record: RecordTableItem): Promise<void> {
    const _resault = await this.recordsService.del(record);
    if (_resault['data']) {
      record.status = 'removed';
      record.isChange = false;
      record.rid = null;
    }
  }

  async reAdd(record: RecordTableItem): Promise<void> {
    const _resault = await this.recordsService.set(record);
    record.rid = _resault['data'][0].rid;
    const _resault2 = await this.recordsService.setType(record.rid, Object.keys(record.tidsObjMap));
    if (_resault['data']) {
      record.status = '';
      record.isChange = false;
    }
  }

  currencyExchange(record: RecordTableItem): boolean {
    record.currencyExhange = this.currencyService.exchange(record.cid, this.defaultCid, record.value);
    return true;
  }

  roundPrice(num: number): number {
    if (num === 0) {
      return 0;
    }
    return Math.round(num * 100) / 100 || 0.01;
  }
}
