import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberDirective } from 'primeng/inputnumber';

@Component({
    selector: 'app-inputnumber-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FormsModule, InputNumberDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pInputNumber</i> on a native <i>input type="number"</i> instead of the deprecated <i>p-inputnumber</i> component. Native <i>min</i>, <i>max</i>, <i>step</i>, validation and forms work without a wrapper.</p>
            <p>Locale and currency formatting, prefixes, suffixes, and custom spinner buttons are wrapper-only features. Keep the legacy component where those capabilities are required during the v22 compatibility period.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <input type="number" pInputNumber [(ngModel)]="quantity" min="0" max="100" step="1" aria-label="Quantity" />
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    quantity = 1;
}
