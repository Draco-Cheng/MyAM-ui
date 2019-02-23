type RecordType = -1 | 0 | 1; // -1 = Cost, 1 = Earn, 0 = Both (For query)

type RecordId = TimeStamp;


interface RecordNode {
  cashType: RecordType;
  cid: Cid;
  date: Date_YYYYMMDD;
  memo: string;
  rid: RecordId;
  tids: Tid[] | TypeFlatMap; // TypeFlatMap only for the new record
  tidsObjMap: TypeFlatMap;
  value: number;
}

type RecordQueryOrderBy = ['rid' | 'date', 'ASC' | 'DESC'];

interface RecordQueryCondition {
  cashType: RecordType;
  cid: Cid;
  end_date: Date_YYYYMMDD;
  limit: '' | number;
  memo: string;
  orderBy: RecordQueryOrderBy;
  start_date: Date_YYYYMMDD;
  tids_json: string; // JSON.stringify(Tid[][]);
  type_query_set: 'intersection' | 'union';
  value_greater: number;
  value_less: number;
}