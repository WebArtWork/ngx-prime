import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { TreeNode } from '@wawjs/ngx-prime/api';
import { TreeTableModule } from '@wawjs/ngx-prime/treetable';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [TreeTableModule, DeferredDemo, AppCode, AppDocSectionText],
    template: ` <app-docsectiontext>
            <p>TreeTable requires a collection of <i>TreeNode</i> instances as a <i>value</i> components as children for the representation.</p>
        </app-docsectiontext>
        <div class="card">
            <app-p-deferred-demo (demoLoad)="loadDemoData()">
                <p-treetable [value]="files" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
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
                                <div class="flex items-center gap-2">
                                    <p-treetable-toggler [rowNode]="rowNode" />
                                    <span>{{ rowData.name }}</span>
                                </div>
                            </td>
                            <td>{{ rowData.size }}</td>
                            <td>{{ rowData.type }}</td>
                        </tr>
                    </ng-template>
                </p-treetable>
            </app-p-deferred-demo>
        </div>
        <app-code></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDoc {
    private nodeService = inject(NodeService);
    private cd = inject(ChangeDetectorRef);

    files!: TreeNode[];

    loadDemoData() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));
    }
}
