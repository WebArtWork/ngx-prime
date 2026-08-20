import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    selector: 'app-knob-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, KnobModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-knob [(ngModel)]="value"></p-knob>
        </app-docptviewer>
    `
})
export class PTViewer {
    value = 0;

    docs = [
        {
            data: getPTOptions('Knob'),
            key: 'Knob'
        }
    ];
}
