// the currency id
type Cid = string;

type CurrencyType = string;

type CurrencyList = CurrencyType[];

// the currency default node whithout any exta data
interface EmptyCurrencyNode {
  type: string;
}

// a fully currency node
interface CurrencyNode {
  childs?: CurrencyNode[];
  cid?: Cid;
  date: Date_YYYYMMDD;
  main: boolean;
  memo: string;
  quickSelect: boolean;
  rate: number;
  to_cid: Cid | null;
  type: CurrencyType;
  preMain?: Cid;
}

// an index map of currency node
interface CurrencyMap {
  [cid: string]: CurrencyNode;
}


interface CurrencyExchangeItem {
  value: number;
  track: Cid[];
  precise_value: number;
  precise_track: Cid[];
  type: Cid;
}

interface CurrencyMaps {
  flatMap: CurrencyMap,
  structureMap: CurrencyMap
}