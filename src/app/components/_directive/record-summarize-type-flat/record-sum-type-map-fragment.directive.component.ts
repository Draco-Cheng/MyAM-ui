import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: '[record-sum-type-map-fragment]',
  templateUrl: './record-sum-type-map-fragment.template.html',
  styleUrls: ['./record-sum-type-map-fragment.style.less'],
  providers: []
})

export class RecordSumTypeMapFragmentDirectiveComponent implements OnInit {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() typesFlat: any;
  @Input() typesMapFlatMeta: any;
  @Input() typeSummerize: any;
  @Input() currencyEx: Function;
  @Input() defaultCid: any;
  @Input() currencyFlatMap: any;
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

  getChildNode() {
    const _parentNodes = this.parentNodes;
    const _currentNode = this.currentNode;
    const _typesFlat = this.typesFlat;
    const _typeSummerize = this.typeSummerize;
    const _typesMapFlat = this.typesMapFlatMeta['data'];
    const _childNodes = this.childNode = [];

    if (_currentNode) {
      if (_typesMapFlat[_currentNode] && _typesMapFlat[_currentNode]['childs']) {
        const _list = Object.keys(_typesMapFlat[_currentNode]['childs']);

        _list.forEach(tid => {
          _typeSummerize['types'][tid] && _parentNodes.indexOf(tid) === -1 && _childNodes.push(tid);
        });
      }
    } else {
      const unclassifiedNodes = {};
      const listOfChild = [];

      _.map(_typesMapFlat, (val, key) => {
        if (key !== '_unclassified') {
          Object.keys(val['childs']).forEach(tid => listOfChild.push(tid));
        }
      });

      _.map(_typesFlat, (node, tid) => {
        if (node.master) {
          _typeSummerize['types'][tid] && _childNodes.push(tid);
        } else {
          listOfChild.indexOf(tid) === -1 && _typeSummerize['types'][tid] && (unclassifiedNodes[tid] = null);
        }
      });

      if (Object.keys(unclassifiedNodes).length) {
        _typesMapFlat['_unclassified'] = { 'childs': unclassifiedNodes };
        _childNodes.push('_unclassified');
      }
    }
  }

  cidToLabel(cid) {
    return this.currencyFlatMap[cid]['type'];
  }

  objArr(obj: object) {
    return _.map(obj, (val, key) => {
      return { key: key, data: val };
    });
  }

  roundPrice(num) {
    if (num === 0) {
      return 0;
    }
    return Math.round(num * 100) / 100 || 0.01;
  }
}
