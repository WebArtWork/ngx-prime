import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'ngx-prime/iftalabel';
import { InputTextModule } from 'ngx-prime/inputtext';

@Component({
    selector: 'app-iftalabel-pt-viewer',
    standalone: true,
    imports: [FormsModule, AppDocPtViewer, IftaLabelModule, InputTextModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-iftalabel>
                <input type="text" pInputText [(ngModel)]="value" />
                <label>Username</label>
            </p-iftalabel>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: string = '';
    docs = [{ data: getPTOptions('IftaLabel'), key: 'IftaLabel' }];
}
