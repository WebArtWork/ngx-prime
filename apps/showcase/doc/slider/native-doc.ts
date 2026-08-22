import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RangeDirective } from 'ngx-prime/slider';

@Component({
    selector: 'app-slider-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FormsModule, RangeDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pRange</i> on a native <i>input type="range"</i> for a lightweight, accessible single-value slider. Native min, max, step, validation and Angular forms work without a wrapper.</p>
            <p>A native range input has one thumb. The legacy <i>p-slider</i> and <i>p-range</i> selectors are deprecated and remain only through v22 for existing two-handle ranges or custom rendering.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <input type="range" pRange [(ngModel)]="value" min="0" max="100" step="5" aria-label="Volume" />
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    value = 50;
}
