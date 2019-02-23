// define import json structure
declare module "*.json" {
  const value: any;
  export default value;
}

// common type
type Date_YYYYMMDD = string;

type TimeStamp = string | number;

type NotificationType = 'error' | 'warn' | 'success';

type CashType = -1 | 0 | 1; // -1 = Cost, 1 = Earn, 0 = Both (For query)

interface SummerizeChild {
  buildSummerize: () => void
}

interface IsChangeViewItem {
  status: string;
  isChange: boolean;
}