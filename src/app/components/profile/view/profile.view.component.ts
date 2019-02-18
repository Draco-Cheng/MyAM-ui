import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { ProfileService } from '../../../service/profile.service';

@Component({
  selector: 'app-profile-content',
  templateUrl: './profile.view.template.html',
  styleUrls: ['./profile.view.style.less'],
  providers: [
    ProfileService
  ]
})

export class ProfileViewComponent implements OnInit {
  public __isInit = false;
  private __meta = {};

  private user;
  private activedDb;
  private selectedDb;
  private breakpointDbList;
  private profileMap;
  private popOutAddDb;
  private dbName;
  private changeDbName;

  private pwd_original;
  private pwd_new;
  private pwd_confirm;


  constructor(
    private profileService: ProfileService
  ) {
    this.profileMap = this.profileService.getProfileMap();
  }

  async ngOnInit() {
    this.getConfig();

    if (this.user['status'] >= 20) {
      await this.setSelectDb(this.activedDb);

      if (!this.user['dbList'].length) {
        this.openAddDbPopOut();
      }
    }

    this.__isInit = true;
  }

  async __checkDataUpToDate() {
    if (this.__meta['config']['legacy']) {
      this.getConfig();
    }
  }

  getConfig() {
    this.__meta['config'] = this.profileService.getConfig();
    const config = _.cloneDeep(this.__meta['config']);
    this.user = config['user'];
    this.activedDb = config['database'];
  }

  formatDate(date) {
    return new Date(date * 1).toDateString();
  }

  async setSelectDb(db ? ) {
    this.getConfig();
    this.selectedDb = db || this.user['dbList'][0];
    this.dbName = this.selectedDb;
    this.changeDbName = false;

    this.selectedDb && await this.getBreakpointDbList();
  }

  async getBreakpointDbList() {
    if (this.selectedDb) {
      const res = await this.profileService.getBreakpointDbList(this.selectedDb);
      const list = < any[] > res['data'];
      this.breakpointDbList = [];

      list.forEach(name => this.breakpointDbList.push({ 'dbName': name }));
    }
  }

  async delDB(dbName) {
    const msg = `Are you sure, you want to delete database: ${dbName}?\nPlease Enter: "${dbName}" to confirm!`;
    if (prompt(msg) === dbName) {
      await this.profileService.delDB(dbName);

      this.setSelectDb();
      this.getBreakpointDbList();
      if (dbName === this.activedDb) {
        this.setActiveDb();
      }
    }
  }

  async delBreakpointDb(breakpointDb) {
    if (this.selectedDb) {
      await this.profileService.delBreakpointDb(this.selectedDb, breakpointDb);
      this.getBreakpointDbList();
    }
  }

  closeAddDbPopOut = (dbName ? ) => {
    if (dbName) {
      this.setSelectDb(dbName);
      this.setActiveDb();
    }

    this.popOutAddDb = false;
  }

  openAddDbPopOut() {
    this.popOutAddDb = true;
  }

  setActiveDb() {
    this.profileService.setActiveDb(this.selectedDb);
    this.activedDb = this.selectedDb;
  }

  downloadDb(breakpointDb) {
    this.profileService.downloadDb(this.selectedDb, breakpointDb);
  }

  async renameDb() {
    const resault = await this.profileService.renameDb(this.selectedDb, this.dbName);
    if (resault['success']) {
      await this.setSelectDb(this.dbName);
      this.changeDbName = false;
    }

  }

  async save() {
    const data = {};
    data['name'] = this.user['name'];
    data['mail'] = this.user['mail'];
    data['breakpoint'] = this.user['breakpoint'];


    if (this.pwd_original && this.pwd_new && this.pwd_new === this.pwd_confirm) {
      data['pwd'] = this.pwd_original;
      data['pwd2'] = this.pwd_new;
    }

    await this.profileService.set(data);
  }
}
