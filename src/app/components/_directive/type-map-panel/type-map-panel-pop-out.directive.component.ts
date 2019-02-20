import { Component, Input } from '@angular/core';

@Component({
  selector: '[type-map-panel-pop-out]',
  templateUrl: './type-map-panel-pop-out.template.html',
  styleUrls: ['./type-map-panel-pop-out.style.less'],
  providers: []
})

export class TypeMapPanelPopOutDirectiveComponent {
  // *************************************
  // Note for who want to use this module
  // -------------------------------------
  // neceesary input
  @Input() selectedTids: TypeFlatMap;
  @Input() disabledTids?: TypeFlatMap;
  @Input() callback: TypeMapCallback;
  // *************************************

  constructor() { }
}
