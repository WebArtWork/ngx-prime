import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-template-doc',
    standalone: true,
    imports: [TreeTableModule, ButtonModule, DeferredDemo, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Custom content at <i>caption</i>, <i>header</i>, <i>body</i> and <i>summary</i> sections are supported via templating.</p>
        </app-docsectiontext>
        <div class="card">
            <app-p-deferred-demo (load)="loadDemoData()">
                <p-treetable [value]="files" [columns]="cols" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #caption><div class="text-xl font-bold">File Viewer</div> </ng-template>
                    <ng-template #header let-columns>
                        <tr>
                            @for (col of columns; let last = $last; track col) {
                                <th [class]="{ 'w-40': last }">
                                    {{ col.header }}
                                </th>
                            }
                        </tr>
                    </ng-template>
                    <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                        <tr [ttRow]="rowNode">
                            @for (col of columns; let first = $first; let last = $last; track col) {
                                <td>
                                    @if (first) {
                                        <div class="flex items-center gap-2">
                                            <p-treetable-toggler [rowNode]="rowNode" />
                                            <span>{{ rowData[col.field] }}</span>
                                        </div>
                                    } @else if (last) {
                                        <div class="flex flex-wrap gap-2">
                                            <p-button icon="pi pi-search" rounded="true" severity="secondary" />
                                            <p-button icon="pi pi-pencil" rounded="true" severity="secondary" />
                                        </div>
                                    } @else {
                                        <span>{{ rowData[col.field] }}</span>
                                    }
                                </td>
                            }
                        </tr>
                    </ng-template>
                    <ng-template #summary>
                        <div style="text-align:left">
                            <p-button icon="pi pi-refresh" label="Reload" severity="warn" />
                        </div>
                    </ng-template>
                </p-treetable>
            </app-p-deferred-demo>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateDoc {
    private nodeService = inject(NodeService);

    files!: TreeNode[];

    cols!: Column[];

    loadDemoData() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' },
            { field: '', header: '' }
        ];
    }
}
