import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { MenuItem } from 'ngx-prime/api';
import { SplitButtonModule } from 'ngx-prime/splitbutton';
import { ToastModule } from 'ngx-prime/toast';

@Component({
    selector: 'app-splitbutton-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, SplitButtonModule, ToastModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-toast />
            <p-splitbutton label="Save" icon="pi pi-check" dropdownIcon="pi pi-cog" [model]="items" />
        </app-docptviewer>
    `
})
export class PTViewer {
    items: MenuItem[];

    constructor() {
        this.items = [
            {
                label: 'Update'
            },
            {
                label: 'Delete'
            },
            { label: 'Angular.dev', url: 'https://angular.dev' }
        ];
    }

    docs = [
        {
            data: getPTOptions('SplitButton'),
            key: 'SplitButton'
        }
    ];
}
