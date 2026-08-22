import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FluidModule } from 'ngx-prime/fluid';
import { InputTextModule } from 'ngx-prime/inputtext';

@Component({
    selector: 'app-fluid-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, FluidModule, InputTextModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-fluid>
                <input type="text" pInputText />
            </p-fluid>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Fluid'),
            key: 'Fluid'
        }
    ];
}
