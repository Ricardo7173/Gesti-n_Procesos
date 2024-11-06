import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    BadgeModule
  ],
  exports: [
    ButtonModule,
    DialogModule,
    InputTextModule,
    BadgeModule
  ]
})
export class PrimengModule { }
