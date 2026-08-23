import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplatesRoutingModule } from './templates-routing.module';
import { TemplatesComponent } from './templates.component';
import { ButtonModule } from '@wawjs/ngx-prime/button';

@NgModule({
    imports: [CommonModule, TemplatesRoutingModule, ButtonModule, TemplatesComponent]
})
export class TemplatesModule {}
