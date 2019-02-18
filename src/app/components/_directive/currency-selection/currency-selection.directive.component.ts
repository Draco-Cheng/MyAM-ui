import { Component, Input, ElementRef, ViewChild, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { CurrencyMapDirectiveComponent } from './currency-map.directive.component';

import { CurrencyService } from '../../../service/currency.service';

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
  @Input() callback: Function;
  // *************************************
  // optional input
  @Input() inputCid?: any;
  @Input() enableAnyOption?: any;
  // *************************************

  @ViewChild('currencySelectInput') currencySelectInput: ElementRef;

  public __isInit = false;
  private __meta = {};

  private cid;
  private currencyStructureMap;
  private currencyFlatMap;
  private quickSelectList;
  public showCurrencyMap;
  private defaultSelectedCurrencyInfo = { type: '---' };
  public selectedCurrencyInfo = this.defaultSelectedCurrencyInfo;

  constructor(
    private currencyService: CurrencyService,
    private elementRef: ElementRef
  ) { }

  async ngOnInit() {
    await this.getCurrency();
    this.cid = this.inputCid || '';
    this.setSelectedCurrencyInfo();
    this.__isInit = true;
  }

  async __checkDataUpToDate() {
    if (this.__meta['currencyMap']['legacy']) {
      await this.getCurrency();
    }
  }

  async getCurrency() {
    this.__meta['currencyMap'] = await this.currencyService.getMap();
    this.currencyStructureMap = this.__meta['currencyMap']['data']['structureMap'];
    this.currencyFlatMap = this.__meta['currencyMap']['data']['flatMap'];

    const quickSelectList = [];
    _.map(this.currencyFlatMap, (val, key) => {
      val.quickSelect && quickSelectList.push(val);
    });
    this.quickSelectList = quickSelectList;
  }

  onSelect(cid) {
    if (cid === -1) {
      this.showCurrencyMap = true;
    } else {
      this.callback(cid || null);
    }

    this.setSelectedCurrencyInfo();
  }

  setSelectedCurrencyInfo() {
    this.selectedCurrencyInfo = this.currencyFlatMap[this.cid] || this.defaultSelectedCurrencyInfo;
  }

  currencyMapCallcak = cid => {
    this.showCurrencyMap = false;
    this.cid = cid || this.inputCid;
    this.callback(this.cid);
    this.setSelectedCurrencyInfo();
  }

  objKeys(obj) {
    return Object.keys(obj);
  }
}
