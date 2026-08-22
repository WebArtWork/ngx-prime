import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TreeNode } from 'ngx-prime/api';
import { TreeTableModule } from 'ngx-prime/treetable';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-sortsinglecolumn-doc',
    standalone: true,
    imports: [TreeTableModule, DeferredDemo, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Sorting on a column is enabled by adding the <i>ttSortableColumn</i> property.</p>
        </app-docsectiontext>
        <div class="card">
            <app-p-deferred-demo (demoLoad)="loadDemoData()">
                <p-treetable [value]="files" [columns]="cols" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #header let-columns>
                        <tr>
                            @for (col of columns; track col) {
                                <th [ttSortableColumn]="col.field">
                                    <div class="flex items-center gap-2">
                                        {{ col.header }}
                                        <p-treetable-sort-icon [field]="col.field" />
                                    </div>
                                </th>
                            }
                        </tr>
                    </ng-template>
                    <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                        <tr [ttRow]="rowNode">
                            @for (col of columns; let first = $first; track col) {
                                <td>
                                    @if (first) {
                                        <div class="flex items-center gap-2">
                                            <p-treetable-toggler [rowNode]="rowNode"></p-treetable-toggler>
                                            <span>{{ rowData[col.field] }}</span>
                                        </div>
                                    } @else {
                                        {{ rowData[col.field] }}
                                    }
                                </td>
                            }
                        </tr>
                    </ng-template>
                </p-treetable>
            </app-p-deferred-demo>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortSingleColumnDoc {
    private nodeService = inject(NodeService);

    files!: TreeNode[];

    cols!: Column[];

    loadDemoData() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));

        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];
    }
}
