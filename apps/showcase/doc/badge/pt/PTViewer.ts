import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { BadgeModule } from 'ngx-prime/badge';
import { OverlayBadgeModule } from 'ngx-prime/overlaybadge';

@Component({
    selector: 'app-badge-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, BadgeModule, OverlayBadgeModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div class="flex flex-wrap gap-8">
                <p-badge value="2"></p-badge>
                <p-overlaybadge value="3">
                    <i class="pi pi-bell" style="font-size: 2rem"></i>
                </p-overlaybadge>
            </div>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Badge'),
            key: 'Badge'
        },
        {
            data: getPTOptions('OverlayBadge'),
            key: 'OverlayBadge'
        }
    ];
}
