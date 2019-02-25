import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { NotificationHandler } from '../handler/notification.handler';

interface TypeMapStructure {
  sequence: number;
  sub_tid: Tid;
  tid: Tid;
}

interface SetTypeFormData {
  tid?: Tid;
  type_label: string;
  cashType: CashType;
  master: boolean | number;
  quickSelect: number | boolean;
  showInMap: number | boolean;
}

type SetTypeResponse = { tid: Tid }[];

export interface ChildsList {
  childs?: Tid[];
  unclassified?: Tid[];
}

interface TidRelatedCache {
  'nodeAllParentsInTree': TypeRelationMap;
  'nodeAllChildsInTree': TypeRelationMap;
  'tidToLabelMap': { [tid: string]: string };
  'rootChildsInNextLayer': {
    'enableShowInMap': ChildsList;
    'disableShowInMap': ChildsList;
  };
}

const tidRelatedCache: TidRelatedCache = {
  'nodeAllParentsInTree': {},
  'nodeAllChildsInTree': {},
  'tidToLabelMap': null,
  'rootChildsInNextLayer': {
    'enableShowInMap': null,
    'disableShowInMap': null
  }
};

@Injectable() export class TypeService {

  private endpoint = '/type';

  constructor(
    private request: RequestHandler,
    private cacheHandler: CacheHandler,
    private notificationHandler: NotificationHandler
  ) {
    this.get();
  }

  wipe(id?: string): void {
    if (id) {
      this.cacheHandler.wipe(id);
    } else {
      this.cacheHandler.wipe('type');
      this.cacheHandler.wipe('type.flat');
      this.cacheHandler.wipe('type.flatmap');
    }

    tidRelatedCache['nodeAllParentsInTree'] = {};
    tidRelatedCache['nodeAllChildsInTree'] = {};
    tidRelatedCache['rootChildsInNextLayer'] = null;
  }

  async get(): Promise<CacheEle<TypeNode[]>> {
    const cacheName = 'type';
    const cache = await this.cacheHandler.get(cacheName, true);

    if (cache.status === 1) {
      return cache;
    } else {
      const resolveCache = this.cacheHandler.regAsyncReq(cacheName);
      const url = this.endpoint + '/get';
      const resault = await this.request.post<TypeNode[]>(url);

      if (resault['success']) {
        this.buildTidToLabelMap(resault['data']);
        return resolveCache(resault['data']);
      } else {
        this.notificationHandler.broadcast('error', resault['message']);
      }
    }
  }

  async getTypeFlat(): Promise<TypeFlat> {
    // TODO: Check it is unneccessary and remove it
    const cacheName = 'type.flat';
    const cache = await this.cacheHandler.get(cacheName, true);

    if (cache.status === 1) {
      return cache;
    } else {
      const resolveCache = this.cacheHandler.regAsyncReq(cacheName);
      const typeData = (await this.get())['data'];

      const typeFlat = {};

      typeData.forEach(element => {
        typeFlat[element.tid] = element;
      });

      return resolveCache(typeFlat);
    }
  }

  buildTidToLabelMap(typeData: TypeNode[]): void {
    tidRelatedCache['tidToLabelMap'] = tidRelatedCache['tidToLabelMap'] || {};
    typeData.forEach(type => tidRelatedCache['tidToLabelMap'][type.tid] = type.type_label);
  }

  async getFlatMap(): Promise<CacheEle<TypeMapFlat>> {
    const cacheName = 'type.flatmap';
    const cache = await this.cacheHandler.get(cacheName, true);

    if (cache.status === 1) {
      return cache;
    } else {
      const resolveCache = this.cacheHandler.regAsyncReq(cacheName);

      const reObj = {};
      const url = this.endpoint + '/getMaps';
      const resault = await this.request.post<TypeMapStructure[]>(url);

      if (resault['success']) {
        resault['data'].forEach(ele => {
          reObj[ele.tid] = reObj[ele.tid] || { childs: {}, parents: {} };
          reObj[ele.tid]['childs'][ele.sub_tid] = ele.sequence || 1;

          reObj[ele.sub_tid] = reObj[ele.sub_tid] || { childs: {}, parents: {} };
          reObj[ele.sub_tid]['parents'][ele.tid] = ele.sequence || 1;
        });

        return resolveCache(reObj);
      } else {
        this.notificationHandler.broadcast('error', resault['message']);
      }
    }
  }

  async set(formObj?: SetTypeFormData): Promise<void> {
    const url = this.endpoint + '/set';
    const data = {
      tid: formObj.tid,
      type_label: formObj.type_label,
      cashType: formObj.cashType,
      master: formObj.master ? 1 : 0,
      quickSelect: formObj.quickSelect ? 1 : 0,
      showInMap: formObj.showInMap ? 1 : 0
    };
    const resault = await this.request.post<SetTypeResponse>(url, data);

    if (resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Updated success!');
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }
  }

  async add(formObj?: SetTypeFormData & { parents: TypeFlatMap }): Promise<ReturnObject<SetTypeResponse>> {
    const urlSet = this.endpoint + '/set';
    const urlSetMap = this.endpoint + '/setMaps';
    const parentsArr = Object.keys(formObj.parents);

    const dataSet = {
      tid: formObj.tid,
      type_label: formObj.type_label,
      cashType: formObj.cashType,
      master: formObj.master ? 1 : 0,
      quickSelect: formObj.quickSelect ? 1 : 0,
      showInMap: formObj.showInMap ? 1 : 0
    };
    const resault = await this.request.post<SetTypeResponse>(urlSet, dataSet);
    const tid = resault['data'][0]['tid'];

    if (!resault['success']) {
      this.notificationHandler.broadcast('error', resault['message']);
      return resault;
    }

    for (let i = 0; i < parentsArr.length; i++) {
      const ptid = parentsArr[i];
      const dataSetMap = {
        tid: ptid,
        sub_tid: tid
      };

      const resaultSetMap = await this.request.post(urlSetMap, dataSetMap);

      if (!resaultSetMap['success']) {
        this.notificationHandler.broadcast('error', resaultSetMap['message']);
      } else {
        this.notificationHandler.broadcast('success', 'Add success!');
      }
    }

    this.wipe();
    return resault;
  }

  async del(del_tid: Tid): Promise<ReturnObject<null>> {
    const url = this.endpoint + '/del';
    const data = {
      del_tid: del_tid
    };
    const resault = await this.request.post<null>(url, data);

    if (resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Deleted success!');
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }


  async unlinkParant(p_tid: Tid, c_tid: Tid): Promise<ReturnObject<null>> {
    const url = this.endpoint + '/delMaps';
    const data = {
      del_tid: p_tid,
      del_sub_tid: c_tid
    };
    const resault = await this.request.post<null>(url, data);


    if (resault['success']) {
      this.wipe('type.flatmap');
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async linkParant(p_tid: Tid, c_tid: Tid): Promise<ReturnObject<null>> {
    const url = this.endpoint + '/setMaps';
    const data = {
      tid: p_tid,
      sub_tid: c_tid
    };
    const resault = await this.request.post<null>(url, data);

    if (resault['success']) {
      this.wipe('type.flatmap');
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async getAllParentsInTree(tid: Tid): Promise<Tid[]> {
    if (!tidRelatedCache['nodeAllParentsInTree'][tid]) {
      const map = (await this.getFlatMap())['data'];
      const arr = [];
      this.getAllParentsInTreeRecursive(map, arr, tid);
      tidRelatedCache['nodeAllParentsInTree'][tid] = arr;
    }
    return tidRelatedCache['nodeAllParentsInTree'][tid];
  }
  getAllParentsInTreeRecursive(map: TypeMapFlat, arr: Tid[], tid: Tid): void {
    if (!map[tid] || !map[tid]['parents'] || arr.indexOf(tid) !== -1) {
      return;
    }

    const keys = Object.keys(map[tid]['parents']);
    arr.push(tid);
    keys.forEach(k => {
      if (arr.indexOf(k) === -1) {
        this.getAllParentsInTreeRecursive(map, arr, k);
      }
    });
  }

  async getAllChildsInTree(tid: Tid): Promise<Tid[]> {
    if (!tidRelatedCache['nodeAllChildsInTree'][tid]) {
      const map = (await this.getFlatMap())['data'];
      const arr = [];
      this.getAllChildsInTreeRecursive(map, arr, tid);
      tidRelatedCache['nodeAllChildsInTree'][tid] = arr;
    }
    return tidRelatedCache['nodeAllChildsInTree'][tid];
  }
  getAllChildsInTreeRecursive(map: TypeMapFlat, arr: Tid[], tid: Tid): void {
    if (!map[tid] || !map[tid]['childs'] || arr.indexOf(tid) !== -1) {
      return;
    }

    arr.push(tid);
    const keys = Object.keys(map[tid]['childs']);
    keys.forEach(k => {
      if (arr.indexOf(k) === -1) {
        this.getAllChildsInTreeRecursive(map, arr, k);
      }
    });
  }

  async getChildsInNextLayer(tid?: Tid, disableShowInMap?: boolean): Promise<ChildsList> {
    if (!tid) {
      const cacheType = disableShowInMap ? 'disableShowInMap' : 'enableShowInMap';
      if (tidRelatedCache['rootChildsInNextLayer'][cacheType]) {
        return tidRelatedCache['rootChildsInNextLayer'][cacheType];
      } else {
        const flatMap = (await this.getFlatMap())['data'];
        const types = (await this.get())['data'];

        const returnObj: ChildsList = {
          childs: [],
          unclassified: []
        };

        types.forEach(type => {
          const tidInLoop = type['tid'];

          if (!disableShowInMap && !type['showInMap']) {
            return;
          }

          if (type['master']) {
            returnObj.childs.push(tidInLoop);
          } else if (!flatMap[tidInLoop] || Object.keys(flatMap[tidInLoop].parents).length === 0) {
            returnObj.unclassified.push(tidInLoop);
          }
        });

        return tidRelatedCache['rootChildsInNextLayer'][cacheType] = returnObj;
      }
    } else {
      const flatMap = (await this.getFlatMap())['data'];
      const types = (await this.get())['data'];

      if (!flatMap[tid]) {
        return {};
      }

      if (disableShowInMap) {
        return { 'childs': Object.keys(flatMap[tid].childs) };
      } else {
        return { 'childs': Object.keys(flatMap[tid].childs).filter(_tid => types[_tid]['showInMap']) };
      }
    }
  }

  tidToLable(tid: Tid): string {
    return tidRelatedCache['tidToLabelMap'][tid];
  }
}
