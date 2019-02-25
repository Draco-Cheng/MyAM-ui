type Permission = 20 | 999 | 9999; // [20]Ragular User [999]Superme [9999]Administrator
type Status = 0 | 20; // [0]Waiting Verify [20]Normal
type Uid = number;

interface UserData {
  breakpoint: string;
  date: TimeStamp;
  mail: string;
  name: string;
  permission: Permission;
  status: Status;
  uid: Uid;
}

interface UserDataForConfig extends UserData {
  dbList: string[];
}

interface UserDataForAdmin extends UserData {
  account: string;
  last_login_info: string;
}

interface ProfileMap {
  permission: {
    [permissionCode in Permission]: string
  },
  status: {
    [statusCode in Status]: string
  }
}