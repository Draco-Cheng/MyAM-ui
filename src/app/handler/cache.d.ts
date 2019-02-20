interface CacheEle<T> {
  status: -1 | 0 | 1; // -1 notReady, 0 async progress, 1 ready
  legacy: boolean;
  waitingQue: Promise<any>[];
  data: T;
}