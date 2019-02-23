import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { ProfileService } from '../../../service/profile.service';

interface BreakpointDb {
  dbName: string;
}

type DbName = string;

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

  private user: UserDataForConfig;
  private activedDb: DbName;
  private selectedDb: DbName;
  private breakpointDbList: BreakpointDb[];
  private profileMap: ProfileMap;
  public popOutAddDb: boolean;
  private dbName: DbName;
  private changeDbName: boolean;

  private pwd_original: string;
  private pwd_new: string;
  private pwd_confirm: string;


  constructor(
    private profileService: ProfileService
  ) {
    this.profileMap = this.profileService.getProfileMap();
  }

  async ngOnInit(): Promise<void> {
    this.getConfig();

    if (this.user['status'] >= 20) {
      await this.setSelectDb(this.activedDb);

      if (!this.user['dbList'].length) {
        this.openAddDbPopOut();
      }
    }

    this.__isInit = true;
  }

  __checkDataUpToDate(): void {
    if (this.__meta['config']['legacy']) {
      this.getConfig();
    }
  }

  getConfig(): void {
    this.__meta['config'] = this.profileService.getConfig();
    const config: Config = _.cloneDeep(this.__meta['config']);
    this.user = config['user'];
    this.activedDb = config['database'];
  }

  formatDate(date: TimeStamp): string {
    return new Date(date).toDateString();
  }

  async setSelectDb(db?: DbName): Promise<void> {
    this.getConfig();
    this.selectedDb = db || this.user['dbList'][0];
    this.dbName = this.selectedDb;
    this.changeDbName = false;

    this.selectedDb && await this.getBreakpointDbList();
  }

  async getBreakpointDbList(): Promise<void> {
    if (this.selectedDb) {
      const res = await this.profileService.getBreakpointDbList(this.selectedDb);
      const list = <DbName[]>res['data'];
      this.breakpointDbList = [];

      list.forEach(name => this.breakpointDbList.push({ 'dbName': name }));
    }
  }

  async delDB(dbName: DbName): Promise<void> {
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

  async delBreakpointDb(breakpointDb: DbName): Promise<void> {
    if (this.selectedDb) {
      await this.profileService.delBreakpointDb(this.selectedDb, breakpointDb);
      this.getBreakpointDbList();
    }
  }

  closeAddDbPopOut = (dbName?: DbName): void => {
    if (dbName) {
      this.setSelectDb(dbName);
      this.setActiveDb();
    }

    this.popOutAddDb = false;
  }

  openAddDbPopOut(): void {
    this.popOutAddDb = true;
  }

  setActiveDb(): void {
    this.profileService.setActiveDb(this.selectedDb);
    this.activedDb = this.selectedDb;
  }

  downloadDb(breakpointDb: DbName): void {
    this.profileService.downloadDb(this.selectedDb, breakpointDb);
  }

  async renameDb(): Promise<void> {
    const resault = await this.profileService.renameDb(this.selectedDb, this.dbName);
    if (resault['success']) {
      await this.setSelectDb(this.dbName);
      this.changeDbName = false;
    }

  }

  async save(): Promise<void> {
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
