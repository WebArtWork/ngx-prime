import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'ngx-prime/api';
import { ToggleSwitchModule } from 'ngx-prime/toggleswitch';
import { TreeTableModule } from 'ngx-prime/treetable';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-selectionmultiple-doc',
    standalone: true,
    imports: [FormsModule, TreeTableModule, ToggleSwitchModule, DeferredDemo, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                More than one node is selectable by setting <i>selectionMode</i> to <i>multiple</i>. By default in multiple selection mode, metaKey press (e.g. <i>âŒ˜</i>) is necessary to add to existing selections however this can be configured with
                disabling the <i>metaKeySelection</i> property. Note that in touch enabled devices, TreeTable always ignores metaKey.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex gap-4 items-center justify-center mb-6">
                <p-toggleswitch [(ngModel)]="metaKeySelection" />
                <span>Metakey</span>
            </div>
            <app-p-deferred-demo (demoLoad)="loadDemoData()">
                <p-treetable [value]="files" [columns]="cols" selectionMode="multiple" [(selection)]="selectedNodes" dataKey="name" [metaKeySelection]="metaKeySelection" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #header let-columns>
                        <tr>
                            @for (col of columns; track col) {
                                <th>
                                    {{ col.header }}
                                </th>
                            }
                        </tr>
                    </ng-template>
                    <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                        <tr [ttRow]="rowNode" [ttSelectableRow]="rowNode">
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
export class SelectionMultipleDoc {
    private nodeService = inject(NodeService);

    metaKeySelection: boolean = true;

    files!: TreeNode[];

    selectedNodes!: TreeNode[];

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
