import { Component, Input, OnInit } from '@angular/core';

import { TypeService } from '../../../service/type.service';

type Callback = (tid) => void;

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
  @Input() selectedTids: TypeFlatMap;
  @Input() callback: Callback;
  // *************************************

  public __isInit = false;
  private __meta = {};

  private types: TypeNode[];
  public typeQuickList: TypeNode[];

  constructor(
    private typeService: TypeService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getTypes();
    this.__isInit = true;
  }

  async __checkDataUpToDate(): Promise<void> {
    if (this.__meta['types']['legacy']) {
      await this.getTypes();
    }
  }

  async getTypes(): Promise<void> {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];
    this.typeQuickList = this.types.filter(type => type.quickSelect);
  }

  isCheck(type: TypeNode): boolean {
    return this.selectedTids[type.tid];
  }
}
