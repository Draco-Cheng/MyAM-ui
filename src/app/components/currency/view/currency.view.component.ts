import { Component, OnInit } from '@angular/core';

import { CurrencyService } from '../../../service/currency.service';
import { promise } from 'protractor';

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
  selector: 'currency-content',
  templateUrl: './currency.view.template.html',
  styleUrls: ['./currency.view.style.less'],
  providers: [
    CurrencyService
  ]
})

export class CurrencyViewComponent implements OnInit {
  public __isInit = false;
  private __meta = {};

  private currencyFlatMap: CurrencyMap;
  private currencyStructureMap: CurrencyMap;
  private currencyList: CurrencyList;

  private newCurrency: CurrencyNode = {
    type: '',
    rate: 1,
    to_cid: null,
    memo: '',
    main: false,
    quickSelect: true,
    date: formatDate(Date.now()),
  };


  constructor(
    private currencyService: CurrencyService
  ) {
    this.currencyList = this.currencyService.getCurrencyList();
  }

  async ngOnInit(): Promise<void> {
    await this.getCurrency();
    this.newCurrency['to_cid'] = this.getDefaultCid();
    this.__isInit = true;
  }

  async __checkDataUpToDate(): Promise<void> {
    if (this.__meta['currencyMap']['legacy']) {
      await this.getCurrency();
    }
  }

  getDefaultCid(): Cid {
    return this.currencyService.getDefaultCid();
  }

  setDefaultCurrency = (cid: Cid): void => {
    this.currencyService.setDefaultCid(cid);
  }

  async getCurrency(): Promise<void> {
    this.__meta['currencyMap'] = await this.currencyService.getMap();
    this.currencyStructureMap = this.__meta['currencyMap']['data']['structureMap'];
    this.currencyFlatMap = this.__meta['currencyMap']['data']['flatMap'];
  }

  getType(cid: Cid): CurrencyType {
    return this.currencyFlatMap[cid].type;
  }

  getCurrentMainType(): CurrencyType {
    return this.getType(Object.keys(this.currencyStructureMap)[0]);
  }

  getSelectionCallback(currency: CurrencyNode) {
    return (cid: Cid): void => {
      currency.to_cid = cid;
    };
  }

  async save(newCurrency: CurrencyNode): Promise<void> {
    await this.currencyService.add(newCurrency);

    newCurrency.memo = '';
    newCurrency.type = '';
    newCurrency.rate = 1;
    newCurrency.main = false;
  }

}
