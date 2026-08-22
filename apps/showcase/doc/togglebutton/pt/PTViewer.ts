import { AppDocPtViewer } from '@/components/doc/app.docptviewer';
import { getPTOptions } from '@/components/doc/app.docptviewer';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'ngx-prime/togglebutton';

@Component({
    selector: 'app-togglebutton-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ToggleButtonModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-togglebutton [(ngModel)]="checked" onLabel="Yes" offLabel="No" onIcon="pi pi-check" offIcon="pi pi-times"></p-togglebutton>
        </app-docptviewer>
    `
})
export class PTViewer {
    checked: boolean = false;

    docs = [{ data: getPTOptions('ToggleButton'), key: 'ToggleButton' }];
}
