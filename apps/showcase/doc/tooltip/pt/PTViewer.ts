import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { TooltipModule } from '@wawjs/ngx-prime/tooltip';

@Component({
    selector: 'app-tooltip-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ButtonModule, TooltipModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-button pTooltip="Confirm to proceed" [hideDelay]="300000" severity="secondary" label="Tooltip" />
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Tooltip'),
            key: 'Tooltip'
        }
    ];
}
