type Tid = string;

interface TypeNode {
  cashType: number,
  master: number,
  quickSelect: number,
  showInMap: number,
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
  _unclassified: {
    childs?: TypeMapNode,
    parents?: TypeMapNode
  }
}

interface TypeMapFlat {
  [tid: string]: {
    childs?: TypeMapNode
    parents?: TypeMapNode
  }
}

type TypeMapCallback = (tid: Tid, typeLabel: string) => void;

