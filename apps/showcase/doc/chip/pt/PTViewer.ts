import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
    selector: 'app-chip-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ChipModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div class="flex flex-wrap gap-4">
                <p-chip label="Action"></p-chip>
                <p-chip label="Comedy"></p-chip>
                <p-chip label="Mystery"></p-chip>
                <p-chip label="Thriller" [removable]="true"></p-chip>
            </div>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Chip'),
            key: 'Chip'
        }
    ];
}
