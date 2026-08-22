import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChipModule } from 'ngx-prime/chip';

@Component({
    selector: 'app-icon-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, ChipModule],
    template: `
        <app-docsectiontext>
            <p>A font icon next to the label can be displayed with the <i>icon</i> property.</p>
        </app-docsectiontext>
        <div class="card flex items-center gap-2 flex-wrap">
            <p-chip label="Apple" icon="pi pi-apple" />
            <p-chip label="Facebook" icon="pi pi-facebook" />
            <p-chip label="Google" icon="pi pi-google" />
            <p-chip label="Microsoft" icon="pi pi-microsoft" [removable]="true" />
        </div>
        <app-code></app-code>
    `
})
export class IconDoc {}
