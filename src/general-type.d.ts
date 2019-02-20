// define import json structure
declare module "*.json" {
  const value: any;
  export default value;
}

// common type
type Date_YYYYMMDD = string;

// the currency id
type Cid = string | number;

// the currency default node whithout any exta data
interface EmptyCurrencyNode {
  type: string
}

// a fully currency node
interface CurrencyNode {
  childs: CurrencyNode[],
  cid: Cid,
  date: Date_YYYYMMDD,
  main: number,
  memo: string
  quickSelect: number,
  rate: number,
  to_cid: Cid | null
  type: string
}

// an index map of currency node
interface CurrencyMap {
  [key: string]: CurrencyNode
}
