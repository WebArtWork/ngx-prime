import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputMaskDirective } from '@wawjs/ngx-prime/inputmask';

@Component({
    selector: 'app-inputmask-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FormsModule, InputMaskDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pInputMask</i> on a native input instead of the deprecated <i>p-inputmask</i> component. Use standard input attributes for presentation and accessibility.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <input pInputMask="99-999999" [(ngModel)]="value" placeholder="99-999999" aria-label="Account number" />
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    value = '';
}
