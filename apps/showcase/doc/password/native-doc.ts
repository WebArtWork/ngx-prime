import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordClearDirective, PasswordDirective, PasswordToggleMaskDirective } from 'ngx-prime/password';

@Component({
    selector: 'app-password-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FormsModule, PasswordDirective, PasswordToggleMaskDirective, PasswordClearDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pPassword</i> on a native password input instead of the deprecated <i>p-password</i> component. The input keeps normal browser validation, autocomplete, and Angular forms behavior.</p>
            <p>Compose optional controls next to the input. Projected wrapper templates are replaced by ordinary Angular content around the native field.</p>
        </app-docsectiontext>
        <div class="card flex flex-wrap items-center gap-2 justify-center">
            <input type="password" pPassword #password="pPassword" [(ngModel)]="value" autocomplete="new-password" placeholder="New password" aria-label="New password" />
            <button type="button" [pPasswordToggleMask]="password">{{ password.visible() ? 'Hide' : 'Show' }}</button>
            <button type="button" [pPasswordClear]="password">Clear</button>
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    value = '';
}
