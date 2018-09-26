import { Component, Input, ElementRef, ViewChild } from '@angular/core';

import { CurrencyMapDirectiveComponent } from './currency-map.directive.component';

import { CurrencyService } from '../../../service/currency.service';

@Component({
  selector: '[currency-selection]',
  templateUrl: './currency-selection.template.html',
  styleUrls: ['./currency-selection.style.less'],
  providers: [CurrencyService],

})

export class CurrencySelectionDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() callback: Function;
  //*************************************
  // optional input
  @Input() inputCid?: any;
  @Input() enableAnyOption?: any;
  //*************************************


  @ViewChild('currencySelectInput') currencySelectInput: ElementRef;

  public __isInit = false;
  private __meta = {};

  private cid;
  private currencyStructureMap;
  private currencyFlatMap;
  private quickSelectList;
  public showCurrencyMap;
  public selectedCurrencyInfo;

  constructor(
    private currencyService: CurrencyService,
    private elementRef: ElementRef
  ) { };

  async ngOnInit() {
    await this.getCurrency();
    this.cid = this.inputCid || '';
    this.setSelectedCurrencyInfo();
    this.__isInit = true;
  };

  async __checkDataUpToDate() {
    if (this.__meta['currencyMap']['legacy']) {
      await this.getCurrency();
    }
  }

  async getCurrency() {
    this.__meta['currencyMap'] = await this.currencyService.getMap();
    this.currencyStructureMap = this.__meta['currencyMap']['data']['structureMap'];
    this.currencyFlatMap = this.__meta['currencyMap']['data']['flatMap'];

    var _quickSelectList = [];
    for (let _key in this.currencyFlatMap) {
      this.currencyFlatMap[_key].quickSelect && _quickSelectList.push(this.currencyFlatMap[_key]);
    }
    this.quickSelectList = _quickSelectList;
  };


  onSelect(cid) {
    if (cid == -1)
      this.showCurrencyMap = true;
    else
      this.callback(cid || null);

    this.setSelectedCurrencyInfo();
  }

  setSelectedCurrencyInfo() {
    this.selectedCurrencyInfo = this.currencyFlatMap[this.cid] || { type: '---' };
  }

  currencyMapCallcak = (function (_self) {
    return cid => {
      _self.showCurrencyMap = false;
      _self.cid = cid || _self.inputCid;
      _self.callback(_self.cid || null);
    };
  })(this);

  objKeys(obj) {
    return Object.keys(obj);
  };
}
