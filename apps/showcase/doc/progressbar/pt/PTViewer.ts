import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { ProgressBarModule } from '@wawjs/ngx-prime/progressbar';

@Component({
    selector: 'app-progressbar-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ProgressBarModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div class="w-full">
                <p-progressbar [value]="50"></p-progressbar>
            </div>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('ProgressBar'),
            key: 'ProgressBar'
        }
    ];
}
