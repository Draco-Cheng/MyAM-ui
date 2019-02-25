import { Component, Input } from '@angular/core';


import { ProfileService } from '../../../service/profile.service';
import { CurrencyService } from '../../../service/currency.service';

type Callback = (dataBaseName?: string) => void;

@Component({
  selector: '[app-add-db-pop-out]',
  templateUrl: './add-db-pop-out.template.html',
  styleUrls: ['./add-db-pop-out.style.less'],
  providers: [
    ProfileService,
    CurrencyService
  ]
})

export class AddDbPopOutDirectiveComponent {
  @Input() callback: Callback;

  private currencyList: CurrencyList;
  private dbName: string;
  private currencyType: CurrencyType;
  private uploadFile: FileList;
  public showUploadBlock: boolean;

  constructor(
    private profileService: ProfileService,
    private currencyService: CurrencyService
  ) {
    this.currencyList = this.currencyService.getCurrencyList();
    this.currencyType = 'USD';
  }

  selectUploadFile(event: Event): void {
    // TODO: make the more correct type definition over here. 'files' is not exist under srcElement definition.
    this.uploadFile = event.srcElement['files'];
  }

  async createDB(): Promise<void> {
    if (this.showUploadBlock) {
      if (this.uploadFile) {
        const _res = await this.profileService.uploadDB(this.dbName, this.uploadFile[0]);

        this.callback(_res['success'] ? this.dbName : null);
      }
    } else {
      await this.profileService.createDB(this.dbName, this.currencyType);
      this.callback(this.dbName);
    }
  }
}
