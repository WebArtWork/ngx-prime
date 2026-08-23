import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from '@wawjs/ngx-prime/colorpicker';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [FormsModule, ColorPickerModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>ColorPicker is used as a controlled input with <i>ngModel</i> property.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-colorpicker [(ngModel)]="color" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    color: string | undefined;
}
