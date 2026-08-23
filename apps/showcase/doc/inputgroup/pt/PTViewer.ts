import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from '@wawjs/ngx-prime/inputgroup';
import { InputGroupAddonModule } from '@wawjs/ngx-prime/inputgroupaddon';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';

@Component({
    selector: 'app-inputgroup-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, InputGroupModule, InputGroupAddonModule, InputTextModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-inputgroup>
                <p-inputgroup-addon>
                    <i class="pi pi-user"></i>
                </p-inputgroup-addon>
                <input pInputText [(ngModel)]="value" placeholder="Username" />
            </p-inputgroup>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: number | null = null;

    docs = [
        {
            data: getPTOptions('InputGroup'),
            key: 'InputGroup'
        },
        {
            data: getPTOptions('InputGroupAddon'),
            key: 'InputGroupAddon'
        }
    ];
}
