import { Component, OnInit } from '@angular/core';

import { TypeService } from '../../../service/type.service';

interface NewTypeNode {
  type_label: string;
  cashType: CashType;
  master: boolean;
  showInMap: boolean;
  quickSelect: boolean;
  parents: TypeFlatMap;
}

@Component({
  selector: 'currency-content',
  templateUrl: './types.view.template.html',
  styleUrls: ['./types.view.style.less'],
  providers: [
    TypeService
  ]
})

export class TypesViewComponent implements OnInit {
  public __isInit = false;
  private __meta = {};

  private types: TypeNode[];
  private typesFlat: TypeFlat = {};
  public typesMapFlatMeta: CacheEle<TypeMapFlat>;

  public showParentSelectPopOut: boolean;
  public newTypeParents = {};
  private newType: NewTypeNode = {
    type_label: '',
    cashType: 0,
    master: false,
    showInMap: true,
    quickSelect: true,
    parents: {}
  };

  constructor(
    private typeService: TypeService
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
    this.types.forEach(element => {
      this.typesFlat[element.tid] = element;
    });
  }

  async getTypesFlatMap(): Promise<void> {
    this.__meta['typesMapFlat'] = await this.typeService.getFlatMap();
    this.typesMapFlatMeta = this.__meta['typesMapFlat'];
  }

  getParents(): Tid[] {
    return Object.keys(this.newType.parents);
  }

  unlinkParant(p_tid: Tid): void {
    delete this.newType.parents[p_tid];
  }

  getTypeMapCallback(): (tid: Tid) => Promise<void> {
    const self = this;
    const newTypeParents: TypeFlatMap = self.newType.parents;

    return async (tid: Tid): Promise<void> => {
      if (!tid) {
        self.showParentSelectPopOut = false;
        return;
      }
      if (newTypeParents.hasOwnProperty(tid)) {
        delete self.newType.parents[tid];
      } else {
        self.newType.parents[tid] = true;
      }
    };
  }

  async add(): Promise<void> {
    const _resault = await this.typeService.add(this.newType);
    if (_resault) {
      this.newType.type_label = '';
      this.newType.parents = {};
    }
  }
}
