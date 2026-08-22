import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'ngx-prime/inputtext';

@Component({
    selector: 'app-inputtext-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, InputTextModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <input pInputText [(ngModel)]="value" placeholder="Username" />
        </app-docptviewer>
    `
})
export class PTViewer {
    value: string | null = null;

    docs = [
        {
            data: getPTOptions('InputText'),
            key: 'InputText'
        }
    ];
}
