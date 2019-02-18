import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable() export class CryptHandler {
  constructor() { }
  encrypt(str: string) {
    const strArr = str.split('');
    let tempStr = <string>Md5.hashStr('');
    for (let i = 0; i < strArr.length; i++) {
      tempStr = <string>Md5.hashStr(tempStr + Md5.hashStr(strArr[i]));
    }

    return Md5.hashStr(tempStr);
  }
}
