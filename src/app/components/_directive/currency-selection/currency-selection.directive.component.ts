import { Component, Input, ElementRef, ViewChild, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { CurrencyService } from '../../../service/currency.service';

// declare function Callback(cid: Cid): void;
type Callback = (cid?: Cid) => void;

@Component({
  selector: '[currency-selection]',
  templateUrl: './currency-selection.template.html',
  styleUrls: ['./currency-selection.style.less'],
  providers: [CurrencyService],

})

export class CurrencySelectionDirectiveComponent implements OnInit {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() callback: Callback;
  // *************************************
  // optional input
  @Input() inputCid?: Cid;
  @Input() enableAnyOption?: boolean;
  // *************************************

  @ViewChild('currencySelectInput') currencySelectInput: ElementRef;

  public __isInit = false;
  private __meta = {};

  private cid: Cid;
  public currencyStructureMap: CurrencyMap;
  private currencyFlatMap: CurrencyMap;
  private quickSelectList: CurrencyNode[];
  public showCurrencyMap: boolean;
  private defaultSelectedCurrencyInfo: EmptyCurrencyNode = { type: '---' };
  public selectedCurrencyInfo: CurrencyNode | EmptyCurrencyNode = this.defaultSelectedCurrencyInfo;

  constructor(
    private currencyService: CurrencyService,
    private elementRef: ElementRef
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getCurrency();
    this.cid = this.inputCid || '';
    this.setSelectedCurrencyInfo();
    this.__isInit = true;
  }

  async __checkDataUpToDate(): Promise<void> {
    if (this.__meta['currencyMap']['legacy']) {
      await this.getCurrency();
    }
  }

  async getCurrency(): Promise<void> {
    this.__meta['currencyMap'] = await this.currencyService.getMap();
    this.currencyStructureMap = this.__meta['currencyMap']['data']['structureMap'];
    this.currencyFlatMap = this.__meta['currencyMap']['data']['flatMap'];

    const quickSelectList = [];
    _.map(this.currencyFlatMap, (val: CurrencyNode, key: Cid) => {
      val.quickSelect && quickSelectList.push(val);
    });
    this.quickSelectList = quickSelectList;
  }

  onSelect(cid: Cid): void {
    if (cid === '-1') {
      this.showCurrencyMap = true;
    } else {
      this.callback(cid || null);
    }

    this.setSelectedCurrencyInfo();
  }

  setSelectedCurrencyInfo(): void {
    this.selectedCurrencyInfo = this.currencyFlatMap[this.cid] || this.defaultSelectedCurrencyInfo;
  }

  currencyMapCallcak = (cid: Cid): void => {
    this.showCurrencyMap = false;
    this.cid = cid || this.inputCid;
    this.callback(this.cid);
    this.setSelectedCurrencyInfo();
  }

  objKeys(obj: object): string[] {
    return Object.keys(obj);
  }
}
