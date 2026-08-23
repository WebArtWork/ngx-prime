import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from '@wawjs/ngx-prime/textarea';

@Component({
    selector: 'app-textarea-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, TextareaModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <textarea pTextarea [(ngModel)]="value" rows="5" cols="30" style="resize: none"></textarea>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: string | null = null;

    docs = [
        {
            data: getPTOptions('Textarea'),
            key: 'Textarea'
        }
    ];
}
