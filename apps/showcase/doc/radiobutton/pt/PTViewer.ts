import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from '@wawjs/ngx-prime/radiobutton';

@Component({
    selector: 'app-radiobutton-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, RadioButtonModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-radiobutton name="pt-demo" value="1" [(ngModel)]="value"></p-radiobutton>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: any = null;

    docs = [
        {
            data: getPTOptions('RadioButton'),
            key: 'RadioButton'
        }
    ];
}
