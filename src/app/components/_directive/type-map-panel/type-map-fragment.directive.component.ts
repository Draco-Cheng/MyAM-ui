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
  @Input() typesFlat: any;
  @Input() typesMapFlatMeta: any;
  @Input() callback: Function;
  @Input() selectedTids: Object;
  @Input() disabledTids?: Object;
  // *************************************
  // internal input
  @Input() parentNodes?: string;
  @Input() currentNode?: number | string;
  // *************************************

  public childNode;

  constructor() { }

  ngOnInit() {
    this.parentNodes = this.parentNodes || '';
    this.currentNode && (this.parentNodes += this.currentNode + ',');
    this.getChildNode();
  }

  __checkDataUpToDate() {
    if (this.typesMapFlatMeta['legacy']) {
      this.getChildNode();
    }
    return true;
  }

  getChildNode() {
    const parentNodes = this.parentNodes;
    const currentNode = this.currentNode;
    const typesFlat = this.typesFlat;
    const typesMapFlat = this.typesMapFlatMeta['data'];
    const childNodes = this.childNode = [];

    if (currentNode) {
      if (typesMapFlat[currentNode] && typesMapFlat[currentNode]['childs']) {
        Object.keys(typesMapFlat[currentNode]['childs'])
          .forEach(tid => {
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

  onSelect(node) {
    this.callback(node, this.typesFlat[node].type_label);
  }

  classCheck(node) {
    if (this.disabledTids && this.disabledTids[node]) {
      return 'disabled';
    }
    if (this.selectedTids[node]) {
      return 'checked';
    }

    return '';
  }
}
