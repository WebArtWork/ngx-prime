import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { SkeletonModule } from '@wawjs/ngx-prime/skeleton';

@Component({
    selector: 'app-skeleton-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, SkeletonModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div class="w-full">
                <p-skeleton styleClass="mb-2"></p-skeleton>
                <p-skeleton width="10rem" styleClass="mb-2"></p-skeleton>
                <p-skeleton width="5rem" styleClass="mb-2"></p-skeleton>
                <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
                <p-skeleton width="10rem" height="4rem"></p-skeleton>
            </div>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Skeleton'),
            key: 'Skeleton'
        }
    ];
}
