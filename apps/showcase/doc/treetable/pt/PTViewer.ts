import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';
import { NodeService } from '@/service/nodeservice';

import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { TreeNode } from 'ngx-prime/api';
import { TreeTableModule } from 'ngx-prime/treetable';

@Component({
    selector: 'app-treetable-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, TreeTableModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-treetable [value]="nodes" [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template #header>
                    <tr>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Type</th>
                    </tr>
                </ng-template>
                <ng-template #body let-rowNode let-rowData="rowData">
                    <tr [ttRow]="rowNode">
                        <td>
                            <p-treetable-toggler [rowNode]="rowNode" />
                            {{ rowData.name }}
                        </td>
                        <td>{{ rowData.size }}</td>
                        <td>{{ rowData.type }}</td>
                    </tr>
                </ng-template>
            </p-treetable>
        </app-docptviewer>
    `
})
export class PTViewer implements OnInit {
    private nodeService = inject(NodeService);
    private cd = inject(ChangeDetectorRef);

    nodes!: TreeNode[];

    docs = [
        {
            data: getPTOptions('TreeTable'),
            key: 'TreeTable'
        }
    ];

    ngOnInit() {
        this.nodeService.getFilesystem().then((data) => {
            this.nodes = data;
            this.cd.markForCheck();
        });
    }
}
