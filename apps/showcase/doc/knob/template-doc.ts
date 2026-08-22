import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'ngx-prime/knob';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-template-doc',
    standalone: true,
    imports: [FormsModule, KnobModule, AppCodeModule, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Label is a string template that can be customized with the <i>valueTemplate</i> property having 60 as the placeholder .</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-knob [(ngModel)]="value" valueTemplate="{value}%" />
        </div>
        <app-code></app-code>
    `
})
export class TemplateDoc {
    value: number = 60;
}
