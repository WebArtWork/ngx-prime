import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { OrganizationChartModule } from '@wawjs/ngx-prime/organizationchart';

@Component({
    selector: 'app-organizationchart-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, OrganizationChartModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-organizationchart [value]="data" [collapsible]="true">
                <ng-template let-node pTemplate="default">
                    <span>{{ node.label }}</span>
                </ng-template>
            </p-organizationchart>
        </app-docptviewer>
    `
})
export class PTViewer {
    data = [
        {
            label: 'Argentina',
            expanded: true,
            children: [
                {
                    label: 'Argentina',
                    expanded: true,
                    children: [
                        {
                            label: 'Argentina'
                        },
                        {
                            label: 'Croatia'
                        }
                    ]
                },
                {
                    label: 'France',
                    expanded: true,
                    children: [
                        {
                            label: 'France'
                        },
                        {
                            label: 'Morocco'
                        }
                    ]
                }
            ]
        }
    ];

    docs = [
        {
            data: getPTOptions('OrganizationChart'),
            key: 'OrganizationChart'
        }
    ];
}
