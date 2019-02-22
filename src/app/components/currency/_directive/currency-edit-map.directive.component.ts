import { Component, Input } from '@angular/core';


import { CurrencyService } from '../../../service/currency.service';

@Component({
  selector: '[currency-edit-map]',
  templateUrl: './currency-edit-map.template.html',
  styleUrls: ['./currency-edit-map.style.less'],
  providers: []
})

export class CurrencyEditMapDirectiveComponent {
  @Input() currentNode?: CurrencyNode;
  @Input() currencyStructureMap?: CurrencyMap;
  @Input() currencyFlatMap?: CurrencyMap;

  private currencyList: CurrencyList;

  constructor(
    private currencyService: CurrencyService
  ) {
    this.currencyList = this.currencyService.getCurrencyList();
  }

  objKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  getType(cid: Cid): CurrencyType {
    return this.currencyFlatMap[cid].type;
  }

  getSelectionCallback(currency: CurrencyNode): (cid: Cid) => void {
    return cid => {
      currency.to_cid = cid;
    };
  }

  async del(node: CurrencyNode): Promise<void> {
    await this.currencyService.del(node.cid);
  }

  async save(node: CurrencyNode): Promise<void> {
    await this.currencyService.set(node);
    node['isChange'] = false;
  }
}
