// the currency id
type Cid = string | number;

type CurrencyType = string;

type CurrencyList = CurrencyType[];

// the currency default node whithout any exta data
interface EmptyCurrencyNode {
  type: string
}

// a fully currency node
interface CurrencyNode {
  childs?: CurrencyNode[],
  cid?: Cid,
  date: Date_YYYYMMDD,
  main: boolean |number,
  memo: string
  quickSelect: boolean | number,
  rate: number,
  to_cid: Cid | null
  type: CurrencyType
}

// an index map of currency node
interface CurrencyMap {
  [cid: string]: CurrencyNode
}
