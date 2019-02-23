import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { TypeService } from '../../../service/type.service';

interface RemoveableTypeNode extends TypeNode {
  isRemoved: boolean;
}

interface RemoveableTypeFlat {
  [tid: string]: RemoveableTypeNode;
}

@Component({
  selector: '[type-map-edit]',
  templateUrl: './type-map-edit.template.html',
  styleUrls: ['./type-map-edit.style.less'],
  providers: [TypeService]
})

export class TypeMapEditDirectiveComponent implements OnInit {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() typesFlat?: RemoveableTypeFlat;
  @Input() typesMapFlatMeta?: CacheEle<TypeMapFlat>;
  // *************************************
  // internal input
  @Input() parentNodes?: string; // tid, tid, tid...
  @Input() currentNode?: Tid;
  // *************************************

  public childNode: TypeNode[];
  private showParentSelectPopOut: boolean;
  private disabledTids: TypeFlatMap = {};

  constructor(
    private typeService: TypeService
  ) { }

  ngOnInit(): void {
    this.parentNodes = this.parentNodes || '';
    this.currentNode && (this.parentNodes += this.currentNode + ',');
    this.disabledTids[this.currentNode] = true;
    this.getChildNode();
  }
  __checkDataUpToDate(): boolean {
    if (this.typesMapFlatMeta['legacy']) {
      this.getChildNode();
    }
    return true;
  }

  getChildNode(): void {
    const parentNodes = this.parentNodes;
    const currentNode = this.currentNode;
    const typesFlat = this.typesFlat;
    const typesMapFlat = this.typesMapFlatMeta['data'];
    const childNodes = this.childNode = [];

    if (currentNode) {
      if (typesMapFlat[currentNode] && typesMapFlat[currentNode]['childs']) {
        const _list = Object.keys(typesMapFlat[currentNode]['childs']);
        _list.forEach(tid => {
          !typesFlat[tid].isRemoved && parentNodes.indexOf(tid) === -1 && childNodes.push(tid);
        });
      }
    } else {
      const _unclassifiedNodes = {};
      const _listOfChild = [];

      _.map(typesMapFlat, (node, key) => {
        if (key !== '_unclassified') {
          Object.keys(node['childs']).forEach(tid => _listOfChild.push(tid));
        }
      });

      for (const _tid in typesFlat) {
        if (typesFlat[_tid].isRemoved) {
          continue;
        }
        if (typesFlat[_tid].master) {
          childNodes.push(_tid);
        } else {
          _listOfChild.indexOf(_tid) === -1 && (_unclassifiedNodes[_tid] = null);
        }
      }

      if (Object.keys(_unclassifiedNodes).length) {
        typesMapFlat['_unclassified'] = { 'childs': _unclassifiedNodes };
        childNodes.push('_unclassified');
      }
    }
  }

  getNodeParents(currentNode: Tid): Tid[] {
    const typesFlat = this.typesFlat;
    const typesMapFlat = this.typesMapFlatMeta['data'];
    const list = [];

    if (typesMapFlat[currentNode] && typesMapFlat[currentNode]['parents']) {
      Object.keys(typesMapFlat[currentNode]['parents']).forEach(_pNode => {
        list.push(typesFlat[_pNode]);
      });
    }
    return list;
  }

  getNodeParentsMap(): TypeMapNode {
    const typesMapFlat = this.typesMapFlatMeta['data'];
    const currentNode = this.currentNode;

    if (typesMapFlat[currentNode] && typesMapFlat[currentNode]['parents']) {
      return typesMapFlat[currentNode]['parents'];
    } else {
      return {};
    }
  }

  getTypeMapCallback(): (tid: Tid) => Promise<void> {
    const self = this;
    const typesMapFlat = self.typesMapFlatMeta['data'];
    const currentNode = self.currentNode;
    const typesFlat = self.typesFlat;

    return async (tid: Tid): Promise<void> => {
      if (!tid) {
        self.showParentSelectPopOut = false;
        return;
      }

      if (typesMapFlat[currentNode] && typesMapFlat[currentNode]['parents'].hasOwnProperty(tid)) {
        await self.unlinkParant(tid);
      } else {
        await self.linkParant(tid);
      }
    };
  }

  async save(node: TypeNode & IsChangeViewItem): Promise<void> {
    await this.typeService.set(node);
    node.isChange = false;
  }

  async unlinkParant(p_tid: Tid): Promise<void> {
    if (p_tid !== this.currentNode) {
      await this.typeService.unlinkParant(p_tid, this.currentNode);
    }
  }

  async linkParant(p_tid: Tid): Promise<void> {
    if (p_tid !== this.currentNode) {
      await this.typeService.linkParant(p_tid, this.currentNode);
    }
  }

  async del(): Promise<void> {
    await this.typeService.del(this.currentNode);
    this.typesFlat[this.currentNode].isRemoved = true;
  }
}
