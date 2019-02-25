import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { AdminServer, SetUserFormData } from '../../../service/admin.service';
import { ProfileService } from '../../../service/profile.service';

@Component({
  selector: 'admin-content',
  templateUrl: './admin.view.template.html',
  styleUrls: ['./admin.view.style.less'],
  providers: [
    ProfileService,
    AdminServer
  ]
})

export class AdminViewComponent implements OnInit {
  public __isInit = false;
  private __meta = {};

  public profileMap: ProfileMap;

  private userList: UserDataForAdmin[];

  constructor(
    private profileService: ProfileService,
    private adminServer: AdminServer
  ) { }

  async ngOnInit(): Promise<void> {
    this.__meta['userList'] = await this.adminServer.getUserList();
    this.userList = _.cloneDeep(this.__meta['userList']['data']);
    this.profileMap = this.profileService.getProfileMap();

    this.__isInit = true;
  }

  async __checkDataUpToDate() { }

  loginInfoToStr(str: string): string[] {
    if (!str) {
      return [];
    }

    const info = str.split('|');
    return [info[0], this.dateString(info[1])];
  }

  dateString(time: string): string {
    return new Date(_.parseInt(time)).toLocaleDateString();
  }

  objKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  async resetPwd(user: UserDataForAdmin): Promise<void> {
    const data: SetUserFormData = {
      target_uid: user['uid'],
      newPwd: user['newPwd']
    };

    await this.adminServer.setUser(data);

    user['newPwd'] = '';
  }

  async updateUser(user: UserDataForAdmin): Promise<void> {
    const data: SetUserFormData = {
      target_uid: user['uid'],
      status: user['status'],
      permission: user['permission']
    };

    const resault = await this.adminServer.setUser(data);

    if (resault['success']) {
      for (const metaUser of this.__meta['userList']['data']) {
        if (metaUser['uid'] === user['uid']) {
          metaUser['status'] = user['status'];
          metaUser['permission'] = user['permission'];
          return;
        }
      }
    } else {
      for (const metaUser of this.__meta['userList']['data']) {
        if (metaUser['uid'] === user['uid']) {
          user['status'] = metaUser['status'];
          user['permission'] = metaUser['permission'];
          return;
        }
      }
    }
  }
}
