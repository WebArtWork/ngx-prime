import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'ngx-prime/iconfield';
import { InputIconModule } from 'ngx-prime/inputicon';
import { InputTextModule } from 'ngx-prime/inputtext';

@Component({
    selector: 'app-iconfield-pt-viewer',
    standalone: true,
    imports: [FormsModule, AppDocPtViewer, IconFieldModule, InputIconModule, InputTextModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-iconfield>
                <p-inputicon class="pi pi-search" />
                <input pInputText [(ngModel)]="value" placeholder="Search" />
            </p-iconfield>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: string | null = null;

    docs = [
        {
            data: getPTOptions('IconField'),
            key: 'IconField'
        },
        {
            data: getPTOptions('InputIcon'),
            key: 'InputIcon'
        }
    ];
}
