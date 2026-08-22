import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'ngx-prime/floatlabel';
import { InputTextModule } from 'ngx-prime/inputtext';

@Component({
    selector: 'app-floatlabel-pt-viewer',
    standalone: true,
    imports: [FormsModule, AppDocPtViewer, FloatLabelModule, InputTextModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-floatlabel>
                <input pInputText id="username" [(ngModel)]="value" autocomplete="off" />
                <label for="username">Username</label>
            </p-floatlabel>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: string | null = null;

    docs = [
        {
            data: getPTOptions('FloatLabel'),
            key: 'FloatLabel'
        }
    ];
}
