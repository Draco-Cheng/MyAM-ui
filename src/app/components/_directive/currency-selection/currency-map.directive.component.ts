import { Component, Input } from '@angular/core';

@Component({
  selector: '[currency-map]',
  templateUrl: './currency-map.template.html',
  styleUrls: ['./currency-map.style.less'],
  providers: []
})

export class CurrencyMapDirectiveComponent {
  //*************************************
  // Note for who want to use this module
  //-------------------------------------
  // neceesary input
  @Input() callback: Function;
  @Input() currencyStructureMap ? : Object;
  @Input() currencyFlatMap ? : Object;
  //*************************************
  // optional input
  @Input() inputCid ? : any;
  //*************************************
  // internal input
  @Input() currentNode ? : any;
  //*************************************

  constructor() {};

  select() {
    if (this.currentNode.cid != this.inputCid) {
      this.callback(this.currentNode.cid);
      this.inputCid = this.currentNode.cid;
    }
  }

  objKeys(obj) {
    return Object.keys(obj);
  };

  getType(tid) {
    return this.currencyFlatMap[tid].type;
  }

}
