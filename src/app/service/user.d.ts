type Permission = 20 | 999 | 9999; // [20]Ragular User [999]Superme [9999]Administrator
type Status = 0 | 20; // [0]Waiting Verify [20]Normal
type Uid = number;

interface UserData {
  account: string;
  breakpoint: string[];
  date: string;
  last_login_info: string;
  mail: string;
  name: string;
  permission: Permission
  status: Status
  uid: Uid
}

interface ProfileMap {
  permission: {
    [permissionCode in Permission]: string
  },
  status: {
    [statusCode in Status]: string
  }
}