import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationBubbleComponent } from './notification-bubble.component';

@NgModule({
  imports: [
  	CommonModule,
  	FormsModule
  ],
  declarations: [
    NotificationBubbleComponent
  ],
  providers: [],
  exports: [NotificationBubbleComponent]
})
export class NotificationBubbleModule {}
