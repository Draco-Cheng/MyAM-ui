import { Injectable } from '@angular/core';

import i18_en from './en-us.json';

var i18nPool = {};
var language = 'en-us';

i18nPool['en-us'] = i18_en;

export function i18n(type, query) {
  try {
    return i18nPool[language][type][query] || console.error('[i18n] query not found:', ' lang=>', language, ', type=>', type, ', msg=>', '"' + query + '"');
  } catch (e) {
    console.error('[i18n] query error: ', ' lang=>', language, ', type=>', type, ', msg=>', '"' + query + '"');
    console.error(e);
    return '';
  }
};
