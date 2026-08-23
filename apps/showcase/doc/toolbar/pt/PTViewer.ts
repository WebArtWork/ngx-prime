import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { IconFieldModule } from '@wawjs/ngx-prime/iconfield';
import { InputIconModule } from '@wawjs/ngx-prime/inputicon';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';
import { ToolbarModule } from '@wawjs/ngx-prime/toolbar';

@Component({
    selector: 'app-toolbar-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ToolbarModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-toolbar class="w-full">
                <ng-template #start>
                    <p-button icon="pi pi-plus" class="mr-2" text severity="secondary" />
                    <p-button icon="pi pi-print" class="mr-2" text severity="secondary" />
                    <p-button icon="pi pi-upload" text severity="secondary" />
                </ng-template>
                <ng-template #center>
                    <p-iconfield iconPosition="left">
                        <p-inputicon class="pi pi-search" />
                        <input type="text" pInputText placeholder="Search" />
                    </p-iconfield>
                </ng-template>
                <ng-template #end>
                    <p-button label="Save" />
                </ng-template>
            </p-toolbar>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Toolbar'),
            key: 'Toolbar'
        }
    ];
}
