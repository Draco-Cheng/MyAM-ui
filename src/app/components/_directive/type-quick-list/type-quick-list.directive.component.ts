import { Component, Input, OnInit } from '@angular/core';

import { TypeService } from '../../../service/type.service';

@Component({
  selector: 'type-quick-list',
  templateUrl: './type-quick-list.template.html',
  styleUrls: ['./type-quick-list.style.less'],
  providers: [TypeService]
})

export class TypeQuickListDirectiveComponent implements OnInit {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() selectedTids: Object;
  @Input() callback: Function;
  // *************************************
  // optional input
  @Input() inputCid?: String;
  // *************************************

  public __isInit = false;
  private __meta = {};

  private types;
  public typeQuickList;

  constructor(
    private typeService: TypeService,
  ) { }

  async ngOnInit() {
    await this.getTypes();
    this.__isInit = true;
  }

  async __checkDataUpToDate() {
    if (this.__meta['types']['legacy']) {
      await this.getTypes();
    }
  }

  async getTypes() {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];
    this.typeQuickList = this.types.filter(type => type.quickSelect);
  }

  isCheck(type) {

    return this.selectedTids[type.tid];
  }
}
