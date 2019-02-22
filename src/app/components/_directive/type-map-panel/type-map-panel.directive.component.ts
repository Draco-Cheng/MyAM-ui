import { Component, Input, ElementRef, OnInit } from '@angular/core';

import { TypeService } from '../../../service/type.service';
import { promise } from 'protractor';

@Component({
  selector: '[type-map-panel]',
  templateUrl: './type-map-panel.template.html',
  styleUrls: ['./type-map-panel.style.less'],
  providers: [TypeService],

})

export class TypeMapPanelDirectiveComponent implements OnInit {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() selectedTids: TypeFlatMap;
  @Input() disabledTids?: TypeFlatMap;
  @Input() callback: TypeMapCallback;
  // *************************************

  public __isInit = false;
  private __meta = {};

  private types: TypeNode[];
  private typesFlat: TypeFlat = {};
  private typesMapFlatMeta: CacheEle<TypeMapFlat>;

  constructor(
    private typeService: TypeService,
    private elementRef: ElementRef
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getTypes();
    await this.getTypesFlatMap();
    this.__isInit = true;
  }

  async __checkDataUpToDate(): Promise<void> {
    if (this.__meta['types']['legacy']) {
      await this.getTypes();
    }
    if (this.__meta['typesMapFlat']['legacy']) {
      await this.getTypesFlatMap();
    }
  }

  async getTypes(): Promise<void> {
    this.__meta['types'] = await this.typeService.get();
    this.types = this.__meta['types']['data'];
    this.types.forEach((element: TypeNode) => {
      this.typesFlat[element.tid] = element;
    });
  }

  async getTypesFlatMap(): Promise<void> {
    this.__meta['typesMapFlat'] = await this.typeService.getFlatMap();
    this.typesMapFlatMeta = this.__meta['typesMapFlat'];
  }
}
