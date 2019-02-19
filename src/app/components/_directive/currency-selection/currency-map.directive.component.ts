import { Component, Input } from '@angular/core';

// declare function Callback(cid: Cid): void;
type Callback = (cid: Cid) => void;

@Component({
  selector: '[currency-map]',
  templateUrl: './currency-map.template.html',
  styleUrls: ['./currency-map.style.less'],
  providers: []
})
export class CurrencyMapDirectiveComponent {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() callback: Callback;
  @Input() currencyStructureMap?: CurrencyMap;
  @Input() currencyFlatMap?: CurrencyMap;
  @Input() inputCid?: Cid;
  // *************************************
  // internal input
  @Input() currentNode?: CurrencyNode;
  // *************************************

  constructor() { }

  select() {
    if (this.currentNode.cid !== this.inputCid) {
      this.callback(this.currentNode.cid);
      this.inputCid = this.currentNode.cid;
    }
  }

  objKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  getType(cid: Cid): string {
    return this.currencyFlatMap[cid].type;
  }

}
