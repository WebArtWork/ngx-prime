import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TreeNode } from '@wawjs/ngx-prime/api';
import { TreeTableModule } from '@wawjs/ngx-prime/treetable';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-scrollfrozencolumns-doc',
    standalone: true,
    imports: [TreeTableModule, DeferredDemo, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>A column can be fixed during horizontal scrolling by enabling the <i>frozenColumns</i> property.</p>
        </app-docsectiontext>
        <div class="card">
            <app-p-deferred-demo (demoLoad)="loadDemoData()">
                <p-treetable [value]="files" [columns]="scrollableCols" [frozenColumns]="frozenCols" [scrollable]="true" scrollHeight="250px" frozenWidth="200px" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #colgroup let-columns>
                        <colgroup>
                            @for (col of columns; track col) {
                                <col style="width:250px" />
                            }
                        </colgroup>
                    </ng-template>
                    <ng-template #header let-columns>
                        <tr>
                            @for (col of columns; track col) {
                                <th>
                                    {{ col.header }}
                                </th>
                            }
                        </tr>
                    </ng-template>
                    <ng-template #body let-rowData="rowData" let-columns="columns">
                        <tr [ttRow]="rowNode" style="height: 57px">
                            @for (col of columns; track col) {
                                <td>
                                    {{ rowData[col.field] }}
                                </td>
                            }
                        </tr>
                    </ng-template>
                    <ng-template #frozenbody let-rowNode let-rowData="rowData">
                        <tr [ttRow]="rowNode" style="height: 57px">
                            <td>
                                <div class="flex items-center gap-2">
                                    <p-treetable-toggler [rowNode]="rowNode" />
                                    <span class="font-bold">{{ rowData.name }}</span>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-treetable>
            </app-p-deferred-demo>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FrozenColumnsDoc {
    private nodeService = inject(NodeService);

    files!: TreeNode[];

    cols!: Column[];

    frozenCols!: Column[];

    scrollableCols!: Column[];

    loadDemoData() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];

        this.scrollableCols = [
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];

        this.frozenCols = [{ field: 'name', header: 'Name' }];
    }
}
