import { Component, Input, Output, OnInit } from '@angular/core';

import { RecordsService } from '../../../service/records.service';
import { TypeService } from '../../../service/type.service';
import { CurrencyService } from '../../../service/currency.service';

@Component({
  selector: '[record-summarize-type-flat]',
  templateUrl: './record-summarize-type-flat.template.html',
  styleUrls: ['./record-summarize-type-flat.style.less'],
  providers: [
    RecordsService,
    TypeService,
    CurrencyService
  ]
})

export class RecordSummarizeTypeFlatDirectiveComponent implements OnInit {
  @Input() getTypeSummerize: Function;

  public __isInit = false;
  private __meta = {};

  private types;
  private typesFlat = {};
  private typesMapFlatMeta;
  public typeSummerize;
  private currencyTotalSummerize;

  private currencyFlatMap;

  private defaultCid;
  private summarizeReady;
  constructor(
    private recordsService: RecordsService,
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) { }

  async ngOnInit() {
    await this.getTypes();
    await this.getCurrency();
    this.buildSummerize();
    this.__isInit = true;
  }

  async getCurrency() {
    const _currencyMap = await this.currencyService.getMap();
    this.currencyFlatMap = _currencyMap['data']['flatMap'];
    this.defaultCid = this.currencyService.getDefaultCid();
  }

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.typesMapFlatMeta = await this.typeService.getFlatMap();

    this.types = this.__meta['types']['data'];

    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  }

  async buildSummerize() {
    this.summarizeReady = false;

    this.typeSummerize = this.getTypeSummerize();
    this.buildTotalByCurrencyType(this.typeSummerize['total']);

    setTimeout(() => this.summarizeReady = true);
  }

  buildTotalByCurrencyType(totalObj) {
    const mergeTotal = this.currencyTotalSummerize = {};
    const defaultCurrencyType = this.cidToCtype(this.defaultCid);
    Object.keys(totalObj)
      .forEach(cid => {
        const cType = this.cidToCtype(cid);
        if (!mergeTotal[cType]) {
          mergeTotal[cType] = {};
          mergeTotal[cType]['count'] = 0;
          mergeTotal[cType]['priceCost'] = 0;
          mergeTotal[cType]['priceEarn'] = 0;

          if (defaultCurrencyType !== cType) {
            mergeTotal[cType]['isExchange'] = true;
            mergeTotal[cType]['priceCostExchange'] = 0;
            mergeTotal[cType]['priceEarnExchange'] = 0;
          }
        }

        mergeTotal[cType]['count'] += totalObj[cid]['count'];
        mergeTotal[cType]['priceCost'] += totalObj[cid]['priceCost'];
        mergeTotal[cType]['priceEarn'] += totalObj[cid]['priceEarn'];

        if (defaultCurrencyType !== cType) {
          mergeTotal[cType]['priceCostExchange'] += this.currencyEx(cid, totalObj[cid]['priceCost']);
          mergeTotal[cType]['priceEarnExchange'] += this.currencyEx(cid, totalObj[cid]['priceEarn']);
        }
      });
  }

  objKey(obj) {
    return Object.keys(obj);
  }

  cidToCtype(cid) {
    return this.currencyFlatMap[cid]['type'];
  }

  currencyEx = (cid, value) => {
    return this.currencyService.exchange(cid, this.defaultCid, value)['value'];
  }

  roundPrice(num) {
    if (num === 0) {
      return 0;
    }

    return Math.round(num * 100) / 100 || 0.01;
  }
}
