import { AppDocPtViewer } from '@/components/doc/app.docptviewer';
import { getPTOptions } from '@/components/doc/app.docptviewer';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'ngx-prime/slider';

@Component({
    selector: 'app-slider-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, SliderModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-slider [(ngModel)]="value" class="w-56"></p-slider>
        </app-docptviewer>
    `
})
export class PTViewer {
    value!: number;

    docs = [{ data: getPTOptions('Slider'), key: 'Slider' }];
}
