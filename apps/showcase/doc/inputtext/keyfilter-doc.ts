import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { KeyFilterModule } from '@wawjs/ngx-prime/keyfilter';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-keyfilter-doc',
    standalone: true,
    imports: [FormsModule, InputTextModule, KeyFilterModule, AppCodeModule, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>InputText has built-in key filtering support to block certain keys, refer to <a href="/keyfilter">keyfilter</a> page for more information.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <input pInputText pKeyFilter="int" placeholder="Integers" [(ngModel)]="value" />
        </div>
        <app-code></app-code>
    `
})
export class KeyFilterDoc {
    value: number | undefined;
}
