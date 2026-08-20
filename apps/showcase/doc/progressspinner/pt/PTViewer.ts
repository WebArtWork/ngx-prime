import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-progressspinner-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ProgressSpinnerModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-progressspinner />
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('ProgressSpinner'),
            key: 'ProgressSpinner'
        }
    ];
}
