type Tid = '_unclassified' | string;

interface TypeNode {
  cashType: CashType,
  master: number | boolean,
  quickSelect: number | boolean,
  showInMap: number | boolean,
  tid: Tid
  type_label: string,
  childs?: TypeNode[]
}

interface TypeFlat {
  [tid: string]: TypeNode
}

interface TypeFlatMap {
  [tid: string]: boolean
}

interface TypeMapNode {
  [tid: string]: 1 | null
}

interface TypeMapFlat {
  [tid: string]: {
    childs?: TypeMapNode
    parents?: TypeMapNode
  }
}

type TypeMapCallback = (tid?: Tid, typeLabel?: string) => void;

interface TypeRelationMap {
  [tid: string]: Tid[]
}
