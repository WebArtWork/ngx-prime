import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputMaskModule } from 'ngx-prime/inputmask';
import { InputText } from 'ngx-prime/inputtext';

@Component({
    selector: 'app-inputmask-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, InputMaskModule, InputText, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <input pInputText [(ngModel)]="value" pInputMask="99-999999" placeholder="99-999999" />
        </app-docptviewer>
    `
})
export class PTViewer {
    value: string | null = null;

    docs = [
        {
            data: getPTOptions('InputMask'),
            key: 'InputMask'
        }
    ];
}
