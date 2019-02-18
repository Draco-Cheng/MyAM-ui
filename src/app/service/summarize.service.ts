import { Injectable } from '@angular/core';

import { RequestHandler } from '../handler/request.handler';
import { CacheHandler } from '../handler/cache.handler';
import { ConfigHandler } from '../handler/config.handler';
import { NotificationHandler } from '../handler/notification.handler';

import { TypeService } from './type.service';
import { CurrencyService } from './currency.service';


@Injectable() export class SummarizeService {
  constructor(
    private typeService: TypeService,
    private currencyService: CurrencyService
  ) { }

  async buildDaySummerize(records) {
    const currencyService = this.currencyService;
    const defaultCid = currencyService.getDefaultCid();
    const summerizeTemp = {};
    const daySummerize = [];

    records.forEach(record => {
      const date = record['date'];

      const dayRecord = summerizeTemp[date] = summerizeTemp[date] || { 'cost': 0, 'earn': 0, 'date': date };
      const price = currencyService.exchange(record['cid'], defaultCid, record['value'])['value'];
      dayRecord[record['cashType'] === -1 ? 'cost' : 'earn'] += price;
    });

    Object.keys(summerizeTemp)
      .sort()
      .forEach(date => daySummerize.push(summerizeTemp[date]));

    return daySummerize;
  }

  async buildTypeSummerize(records) {
    const typeService = this.typeService;
    const currencyService = this.currencyService;
    const defaultCid = currencyService.getDefaultCid();
    const typeSummerize = {};

    typeSummerize['types'] = {};
    typeSummerize['typeNone'] = {};
    typeSummerize['total'] = {};
    typeSummerize['sum'] = {};

    for (const record of records) {
      const parentTids = {};
      for (const tid of record.tids) {
        const allRelateNode = await typeService.getAllParentsInTree(tid);
        for (const ptid of allRelateNode) {
          parentTids[ptid] = true;
        }

        parentTids[tid] = true;
      }

      Object.keys(parentTids)
        .forEach(tid => {
          if (!typeSummerize['types'][tid]) {
            typeSummerize['types'][tid] = {};
          }

          if (!typeSummerize['types'][tid][record.cid]) {
            typeSummerize['types'][tid][record.cid] = {
              count: 0,
              priceCost: 0,
              priceEarn: 0
            };
          }

          const _tcItem = typeSummerize['types'][tid][record.cid];
          _tcItem['count'] += 1;
          _tcItem[record['cashType'] === -1 ? 'priceCost' : 'priceEarn'] += record['value'];
        });

      if (Object.keys(parentTids).length === 0) {
        if (!typeSummerize['typeNone'][record.cid]) {
          typeSummerize['typeNone'][record.cid] = {
            count: 0,
            priceCost: 0,
            priceEarn: 0
          };
        }

        const ncItem = typeSummerize['typeNone'][record.cid];
        ncItem['count'] += 1;
        ncItem[record['cashType'] === -1 ? 'priceCost' : 'priceEarn'] += record['value'];
      }

      if (!typeSummerize['total'][record.cid]) {
        typeSummerize['total'][record.cid] = {
          count: 0,
          priceCost: 0,
          priceEarn: 0
        };
      }

      const cItem = typeSummerize['total'][record.cid];
      cItem['count'] += 1;
      cItem[record['cashType'] === -1 ? 'priceCost' : 'priceEarn'] += record['value'];

    }

    let sumCost = 0;
    let sumEarn = 0;
    let sumCount = 0;

    Object.keys(typeSummerize['total'])
      .forEach(cid => {
        if (cid === defaultCid) {
          sumCost += typeSummerize['total'][cid]['priceCost'];
          sumEarn += typeSummerize['total'][cid]['priceEarn'];
        } else {
          sumCost += currencyService.exchange(cid, defaultCid, typeSummerize['total'][cid]['priceCost'])['value'];
          sumEarn += currencyService.exchange(cid, defaultCid, typeSummerize['total'][cid]['priceEarn'])['value'];
        }
        sumCount += typeSummerize['total'][cid]['count'];
      });

    typeSummerize['sum']['priceCost'] = sumCost;
    typeSummerize['sum']['priceEarn'] = sumEarn;
    typeSummerize['sum']['sum'] = sumEarn - sumCost;
    typeSummerize['sum']['count'] = sumCount;

    return typeSummerize;
  }


  async typeSummerizeToPieChart(typeSummerize, typelist, unclassifiedTypeList, showTypeNone?) {
    const ngxChartData = [];

    for (let i = 0; i < typelist.length; i++) {
      const tid = typelist[i];
      let costSum = 0;
      let earnSum = 0;

      Object.keys(typeSummerize['types'][tid])
        .forEach(cid => {
          const typeSumRecord = typeSummerize['types'][tid][cid];
          costSum += this.currencyService.exchange(cid, null, typeSumRecord['priceCost'])['value'];
          earnSum += this.currencyService.exchange(cid, null, typeSumRecord['priceEarn'])['value'];
        });

      if (costSum || earnSum) {
        const tidLabel = await this.typeService.tidToLable(tid);
        costSum && ngxChartData.push({ 'name': `[C] ${tidLabel}`, 'value': costSum });
        earnSum && ngxChartData.push({ 'name': `[E] ${tidLabel}`, 'value': earnSum });
      }
    }

    if (unclassifiedTypeList) {
      for (let i = 0; i < unclassifiedTypeList.length; i++) {
        const tid = unclassifiedTypeList[i];
        let costSum = 0;
        let earnSum = 0;
        Object.keys(typeSummerize['types'][tid])
          .forEach(cid => {
            const typeSumRecord = typeSummerize['types'][tid][cid];
            costSum += this.currencyService.exchange(cid, null, typeSumRecord['priceCost'])['value'];
            earnSum += this.currencyService.exchange(cid, null, typeSumRecord['priceEarn'])['value'];
          });

        if (costSum || earnSum) {
          const tidLabel = 'Unclassified Types';
          costSum && ngxChartData.push({ 'name': `[C] ${tidLabel}`, 'value': costSum });
          earnSum && ngxChartData.push({ 'name': `[E] ${tidLabel}`, 'value': earnSum });
        }
      }
    }

    if (showTypeNone && typeSummerize['typeNone']) {
      const typeNoneSum = typeSummerize['typeNone'];
      let typeNoneCostSum = 0;
      let typeNoneEarnSum = 0;

      Object.keys(typeNoneSum)
        .forEach(cid => {
          const typeNoneSumRecord = typeNoneSum[cid];
          typeNoneCostSum += this.currencyService.exchange(cid, null, typeNoneSumRecord['priceCost'])['value'];
          typeNoneEarnSum += this.currencyService.exchange(cid, null, typeNoneSumRecord['priceEarn'])['value'];
        });

      if (typeNoneCostSum || typeNoneEarnSum) {
        const tidLabel = 'No Type Records';
        typeNoneCostSum && ngxChartData.push({ 'name': `[C] ${tidLabel}`, 'value': typeNoneCostSum });
        typeNoneEarnSum && ngxChartData.push({ 'name': `[E] ${tidLabel}`, 'value': typeNoneEarnSum });
      }

    }

    return ngxChartData;
  }

  async daySummerizeToLineChart(daySummerize) {
    const ngxChartData = {};

    ['Cost', 'Earn', 'Sum'].forEach(valeType => {
      ngxChartData[valeType] = {
        'name': valeType,
        'series': []
      };
    });

    let valueCost = 0;
    let valueEarn = 0;

    daySummerize.forEach(dayRecord => {
      valueCost += dayRecord['cost'] || 0;
      valueEarn += dayRecord['earn'] || 0;

      ngxChartData['Cost']['series'].push({ name: dayRecord['date'], value: valueCost });
      ngxChartData['Earn']['series'].push({ name: dayRecord['date'], value: valueEarn });
      ngxChartData['Sum']['series'].push({ name: dayRecord['date'], value: valueEarn - valueCost });
    });

    return ngxChartData;
  }
}
