import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { AdminServer } from '../../../service/admin.service';
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

  private profileMap;

  private userList;

  constructor(
    private profileService: ProfileService,
    private adminServer: AdminServer
  ) {

  }

  async ngOnInit() {
    this.__meta['userList'] = await this.adminServer.getUserList();
    this.userList = _.cloneDeep(this.__meta['userList']['data']);
    this.profileMap = this.profileService.getProfileMap();

    this.__isInit = true;
  }

  async __checkDataUpToDate() {}

  loginInfoToStr(str) {
    if (!str) {
      return [];
    }

    const info = str.split('|');
    return [info[0], this.dateString(info[1])];
  }

  dateString(time) {
    return new Date(time * 1).toLocaleDateString();
  }

  objKeys(obj) {
    return Object.keys(obj);
  }

  async resetPwd(user) {
    const data = {
      target_uid: user['uid'],
      newPwd: user['newPwd']
    };

    await this.adminServer.setUser(data);

    user['newPwd'] = '';

  }

  async updateUser(user) {
    const data = {
      target_uid: user['uid'],
      status: _.parseInt(user['status']),
      permission: _.parseInt(user['permission'])
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
