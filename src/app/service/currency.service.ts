import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { ConfigHandler } from '../handler/config.handler';
import { NotificationHandler } from '../handler/notification.handler';

import currencyList from './currency.list.json';

const currencyExchangeMemoryCache = {};
let currencyMapForExchangeMemoryCache = null;

@Injectable() export class CurrencyService {
  private currencyList = currencyList;
  private endpoint = '/currency';

  constructor(
    private request: RequestHandler,
    private config: ConfigHandler,
    private cacheHandler: CacheHandler,
    private notificationHandler: NotificationHandler
  ) {
    this.get();
    this.getMap();
  }

  wipe() {
    this.cacheHandler.wipe('currency');
    this.cacheHandler.wipe('currency.map');
  }

  setConfigCid(defaultCid, flatMap) {
    const uid = this.config.get('uid');
    const localCid = localStorage.getItem(uid + '.cid');
    if (localCid && flatMap[localCid]) {
      this.config.set('cid', localCid);
    } else {
      this.config.set('cid', defaultCid);
      localStorage.setItem(uid + '.cid', defaultCid);
    }
  }

  getDefaultCid() {
    return this.config.get('cid');
  }

  getCurrencyList() {
    return this.currencyList;
  }

  async get(formObj?: any) {
    const cacheName = 'currency';
    const cache = await this.cacheHandler.get(cacheName, true);
    if (cache.status === 1) {
      return cache;
    } else {
      const resolveCache = this.cacheHandler.regAsyncReq(cacheName);
      const url = this.endpoint + '/get';
      const resualt = await this.request.post(url);

      if (resualt['success']) {
        return resolveCache(resualt['data']);
      } else {
        this.notificationHandler.broadcast('error', resualt['message']);
      }
    }
  }


  async getMap() {
    const cacheName = 'currency.map';
    const cache = await this.cacheHandler.get(cacheName, true);

    if (cache.status === 1) {
      return cache;
    } else {
      const resolveCache = this.cacheHandler.regAsyncReq(cacheName);
      const currency = (await this.get())['data'];
      const structureMap = {};
      const flatMap = {};
      let rootCid;

      // build flate map
      currency.forEach(cur => {
        flatMap[cur.cid] = cur;
        cur.childs = [];
      });

      // put child in parent
      currency.forEach(cur => {
        if (cur.main) {
          if (cur.to_cid) {
            flatMap[cur.to_cid].preMain = cur.cid;
          } else {
            rootCid = cur.cid;
          }
        } else {
          flatMap[cur.to_cid].childs.push(cur);
        }
      });

      // set config cid
      this.setConfigCid(rootCid, flatMap);

      do {
        structureMap[rootCid] = flatMap[rootCid];
        rootCid = flatMap[rootCid].preMain || null;
      } while (!!rootCid);

      const _output = {
        flatMap: flatMap,
        structureMap: structureMap
      };

      currencyMapForExchangeMemoryCache = _output;

      return resolveCache(_output);
    }
  }

  async set(formObj: any) {
    const url = this.endpoint + '/set';
    const data = {
      cid: formObj.cid,
      type: formObj.type,
      rate: formObj.rate,
      to_cid: formObj.to_cid,
      memo: formObj.memo,
      quickSelect: formObj.quickSelect,
      date: formObj.date,
      main: formObj.main
    };


    const resault = await this.request.post(url, data);

    if (resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Updated success!');
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async add(formObj: any) {
    const url = this.endpoint + '/set';
    const data = {
      type: formObj.type,
      rate: formObj.rate,
      to_cid: formObj.main ? null : formObj.to_cid,
      memo: formObj.memo,
      quickSelect: formObj.quickSelect,
      date: formObj.date,
      main: formObj.main
    };

    const resault = await this.request.post(url, data);

    if (resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Add success!');
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  async del(del_cid) {
    const url = this.endpoint + '/del';
    const data = {
      del_cid: del_cid
    };

    const resault = await this.request.post(url, data);

    if (resault['success']) {
      this.wipe();
      this.notificationHandler.broadcast('success', 'Deleted success!');
    } else {
      this.notificationHandler.broadcast('error', resault['message']);
    }

    return resault;
  }

  setDefaultCid(cid) {
    localStorage.setItem(this.config.get('uid') + '.cid', cid);
    this.config.set('cid', cid);
  }

  exchange(sCid, tCid, value) {

    sCid = (sCid || this.getDefaultCid()).toString();
    tCid = (tCid || this.getDefaultCid()).toString();

    const currencyExchangeCache = currencyExchangeMemoryCache;
    const currencyMapForExchangeCache = currencyMapForExchangeMemoryCache;

    if (!currencyMapForExchangeCache) {
      return console.error('[currency.exchange] currencyMapForExchangeCache not ready... please get currency map first!');
    }

    if (!currencyExchangeCache[sCid] || !currencyExchangeCache[sCid][tCid]) {
      const map = currencyMapForExchangeCache;
      const flatMap = map['flatMap'];
      const structureMap = map['structureMap'];
      const mainCurrencyList = Object.keys(structureMap);

      let sIndex = sCid;
      let tIndex = tCid;

      // the list for initial _s from sorce, _t from target cid
      const sList = [];
      const sTypeList = [];
      const sRateList = [];
      const tList = [];
      const tTypeList = [];
      const tRateList = [];

      // the list remove duplicate cid (precisely rate), concat from _sList and _tList
      let pList = [];
      let pTypeList = [];
      let pRateList = [];

      // the list remove duplicate type and cid, made from _pList
      let list = [];
      let typeList = [];
      let rateList = [];

      // rate
      let pRate = 1;
      let rate = 1;

      // get sCid currency list to main currency
      let sStopFlag = false;
      do {
        sList.push(sIndex);
        sTypeList.push(flatMap[sIndex]['type']);
        sRateList.push(flatMap[sIndex]['rate']);

        if (!flatMap[sIndex]['main']) {
          sIndex = flatMap[sIndex]['to_cid'].toString();
        } else {
          sStopFlag = true;
        }
      } while (!sStopFlag);

      // get tCid currency list to main currency
      let tStopFlag = false;
      do {
        tList.unshift(tIndex);
        tTypeList.unshift(flatMap[tIndex]['type']);
        tRateList.unshift(1 / flatMap[tIndex]['rate']);

        if (!flatMap[tIndex]['main']) {
          tIndex = flatMap[tIndex]['to_cid'].toString();
        } else {
          tStopFlag = true;
        }
      } while (!tStopFlag);

      // add main currency to list
      if (sIndex !== tIndex) {
        const sIndexOf = mainCurrencyList.indexOf(sIndex);
        const tIndexOf = mainCurrencyList.indexOf(tIndex);

        if (sIndexOf < tIndexOf) {
          mainCurrencyList.slice(sIndexOf + 1, tIndexOf).forEach(mCid => {
            sList.push(mCid);
            sTypeList.push(flatMap[mCid]['type']);
            sRateList.push(1 / flatMap[mCid]['rate']);
          });
        } else {
          mainCurrencyList.slice(tIndexOf + 1, sIndexOf).forEach(mCid => {
            tList.unshift(mCid);
            tTypeList.unshift(flatMap[mCid]['type']);
            tRateList.unshift(flatMap[mCid]['rate']);
          });
        }
      }

      // initial _pList concat sList & tList
      pList = [...sList, ...tList];
      pTypeList = [...sTypeList, ...tTypeList];
      pRateList = [...sRateList, ...tRateList];

      // remove duplicat path (precise rate path)
      let pListCkeckIndex = 0;
      do {
        const pListReverse = [...pList].reverse();
        const pListReverseCkeckIndex = (pList.length - 1) - pListReverse.indexOf(pList[pListCkeckIndex]);

        if (pListReverseCkeckIndex - pListCkeckIndex >= 1) {
          pRateList[pListCkeckIndex] = 1;
          pRateList[pListReverseCkeckIndex] = 1;
        }

        if (pListReverseCkeckIndex - pListCkeckIndex > 1) {
          const spliceStart = pListCkeckIndex + 1;
          const spliceNumber = pListReverseCkeckIndex - spliceStart;
          pList.splice(spliceStart, spliceNumber);
          pTypeList.splice(spliceStart, spliceNumber);
          pRateList.splice(spliceStart, spliceNumber);
        }


        pListCkeckIndex += 1;
      } while (pListCkeckIndex < pList.length);


      // initial list
      list = [...pList];
      typeList = [...pTypeList];
      rateList = [...pRateList];

      // remove duplicat type (short type rate path)
      let typeListCkeckIndex = 0;
      do {
        const typeListReverse = [...typeList].reverse();
        const typeListReverseCkeckIndex = (typeList.length - 1) - typeListReverse.indexOf(typeList[typeListCkeckIndex]);

        if (typeListReverseCkeckIndex - typeListCkeckIndex > 1) {
          const spliceStart = typeListCkeckIndex + 1;
          const spliceNumber = typeListReverseCkeckIndex - spliceStart;

          list.splice(spliceStart, spliceNumber);
          typeList.splice(spliceStart, spliceNumber);
          rateList.splice(spliceStart, spliceNumber);
          rateList[typeListCkeckIndex] = 1;
          rateList[typeListCkeckIndex + 1] = 1;
        }
        typeListCkeckIndex += 1;
      } while (typeListCkeckIndex < typeList.length);

      // caculate the rate
      pRateList.forEach(r => {
        pRate = pRate * r;
      });
      rateList.forEach(r => {
        rate = rate * r;
      });

      // write sCid->tCid resualt the cache
      currencyExchangeCache[sCid] = currencyExchangeCache[sCid] || {};
      currencyExchangeCache[sCid][tCid] = {
        rate: rate,
        track: list,
        precise_rate: pRate,
        precise_track: pList,
        fromType: flatMap[sCid]['type'],
        toType: flatMap[tCid]['type']
      };

      // write tCid-> sCid resualt the cache
      currencyExchangeCache[tCid] = currencyExchangeCache[tCid] || {};
      currencyExchangeCache[tCid][sCid] = {
        rate: 1 / rate,
        track: [...list].reverse(),
        precise_rate: 1 / pRate,
        precise_track: [...pList].reverse(),
        fromType: flatMap[tCid]['type'],
        toType: flatMap[sCid]['type']
      };
    }

    const cObj = currencyExchangeCache[sCid][tCid];

    return {
      value: value * cObj['rate'],
      track: cObj['track'],
      precise_value: value * cObj['precise_rate'],
      precise_track: cObj['precise_track'],
      type: cObj['toType']
    };
  }
}
