// define import json structure
declare module "*.json" {
  const value: any;
  export default value;
}

// common type
type Date_YYYYMMDD = string;