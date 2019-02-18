import { Injectable } from '@angular/core';

import i18_en from './en-us.json';

const i18nPool = {};
const language = 'en-us';

i18nPool['en-us'] = i18_en;

// TODO: use ngx-translate instead
export function i18n(type, query): string {
  const errorMassage = `lang=>${language} type=>${type} msg=>${query}`;
  try {
    return i18nPool[language][type][query] || console.error(`[i18n] query not found: ${errorMassage}`);
  } catch (e) {
    console.error(`[i18n] query error: ${errorMassage}`);
    console.error(e);
    return '';
  }
}
