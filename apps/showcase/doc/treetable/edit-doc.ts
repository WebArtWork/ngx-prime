import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { InputTextModule } from 'primeng/inputtext';
import { AppCodeComponent } from '@/components/doc/app.code.component';
import { AppDocSectionTextComponent } from '@/components/doc/app.docsectiontext.component';
import { DeferredDemo } from '@/components/demo/deferreddemo';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-edit-doc',
    standalone: true,
    imports: [CommonModule, FormsModule, TreeTableModule, InputTextModule, AppCodeComponent, AppDocSectionTextComponent, DeferredDemo],
    template: `
        <app-docsectiontext>
            <p>Incell editing is enabled by defining input elements with <i>treeTableCellEditor</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <app-p-deferred-demo (load)="loadDemoData()">
                <p-treetable [value]="files" [columns]="cols" [scrollable]="true" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template pTemplate="header" let-columns>
                        <tr>
                            @for (col of columns; track col) {
                                <th>
                                    {{ col.header }}
                                </th>
                            }
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-rowNode let-rowData="rowData" let-columns="columns">
                        <tr [ttRow]="rowNode">
                            @for (col of columns; track col; let i = $index) {
                                <td ttEditableColumn [ttEditableColumnDisabled]="i == 0" [ngClass]="{ 'p-toggler-column': i === 0 }">
                                    @if (i === 0) {
                                        <p-treeTableToggler [rowNode]="rowNode" />
                                    }
                                    <p-treetableCellEditor>
                                        <ng-template pTemplate="input">
                                            <input pInputText type="text" [(ngModel)]="rowData[col.field]" />
                                        </ng-template>
                                        <ng-template pTemplate="output">{{ rowData[col.field] }}</ng-template>
                                    </p-treetableCellEditor>
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
export class EditDoc {
    files!: TreeNode[];

    cols!: Column[];

    constructor(private nodeService: NodeService) {}

    loadDemoData() {
        this.nodeService.getFilesystem().then((files) => (this.files = files));
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];
    }
}
