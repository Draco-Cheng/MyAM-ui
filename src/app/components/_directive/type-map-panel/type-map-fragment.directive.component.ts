import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: '[type-map-fragment]',
  templateUrl: './type-map-fragment.template.html',
  styleUrls: ['./type-map-fragment.style.less'],
  providers: []
})

export class TypeMapFragmentDirectiveComponent implements OnInit {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() typesFlat: TypeFlat;
  @Input() typesMapFlatMeta: CacheEle<TypeMapFlat>;
  @Input() callback: TypeMapCallback;
  @Input() selectedTids: TypeFlatMap;
  @Input() disabledTids?: TypeFlatMap;
  // *************************************
  // internal input
  @Input() parentNodes?: string;
  @Input() currentNode?: string;
  // *************************************

  public childNode: Tid[];

  constructor() { }

  ngOnInit(): void {
    this.parentNodes = this.parentNodes || '';
    this.currentNode && (this.parentNodes += this.currentNode + ',');
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
        Object.keys(typesMapFlat[currentNode]['childs'])
          .forEach((tid: Tid) => {
            typesFlat[tid].showInMap && parentNodes.indexOf(tid) === -1 && childNodes.push(tid);
          });
      }
    } else {
      const unclassifiedNodes = {};
      const listOfChild = [];

      _.map(typesMapFlat, (node, key) => {
        if (key !== '_unclassified') {
          Object.keys(node['childs']).forEach(tid => listOfChild.push(tid));
        }
      });

      _.map(typesFlat, (node, tid) => {
        if (node.master) {
          node.showInMap && childNodes.push(tid);
        } else {
          listOfChild.indexOf(tid) === -1 && node.showInMap && (unclassifiedNodes[tid] = null);
        }
      });

      if (Object.keys(unclassifiedNodes).length) {
        typesMapFlat['_unclassified'] = { 'childs': unclassifiedNodes };
        childNodes.push('_unclassified');
      }
    }
  }

  onSelect(tid: Tid) {
    this.callback(tid, this.typesFlat[tid].type_label);
  }

  classCheck(tid: Tid) {
    if (this.disabledTids && this.disabledTids[tid]) {
      return 'disabled';
    }
    if (this.selectedTids[tid]) {
      return 'checked';
    }

    return '';
  }
}
