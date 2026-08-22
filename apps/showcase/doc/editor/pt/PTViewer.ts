import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'ngx-prime/editor';

@Component({
    selector: 'app-editor-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, EditorModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-editor [(ngModel)]="value" [style]="{ height: '320px' }"></p-editor>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: any = '';
    docs = [{ data: getPTOptions('Editor'), key: 'Editor' }];
}
