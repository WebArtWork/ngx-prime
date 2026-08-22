import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'ngx-prime/togglebutton';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [FormsModule, ToggleButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-togglebutton</i>, <i>p-toggleButton</i>, and <i>p-toggle-button</i> are deprecated. Use native <i>button pToggleButton</i> for new controls; the legacy component remains available through v22 for compatibility and wrapper
                templates.
            </p>
            <p>Two-way binding to a boolean property is defined using the standard <i>ngModel</i> directive.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-togglebutton [(ngModel)]="checked" onLabel="On" offLabel="Off" class="w-24" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    checked: boolean = false;
}
