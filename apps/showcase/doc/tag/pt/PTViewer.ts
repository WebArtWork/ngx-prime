import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { TagModule } from 'ngx-prime/tag';

@Component({
    selector: 'app-tag-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, TagModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-tag icon="pi pi-user" value="Primary"></p-tag>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Tag'),
            key: 'Tag'
        }
    ];
}
