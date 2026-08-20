import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';

@Component({
    selector: 'app-colorpicker-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ColorPickerModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-colorpicker [(ngModel)]="color" [inline]="true"></p-colorpicker>
        </app-docptviewer>
    `
})
export class PTViewer {
    color: string | undefined;

    docs = [{ data: getPTOptions('ColorPicker'), key: 'ColorPicker' }];
}
