import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'ngx-prime/api';
import { TreeModule } from 'ngx-prime/tree';

@Component({
    selector: 'app-checkbox-doc',
    standalone: true,
    imports: [TreeModule, FormsModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Selection of multiple nodes via checkboxes is enabled by configuring <i>selectionMode</i> as <i>checkbox</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <p-tree [value]="files()" selectionMode="checkbox" class="w-full md:w-[30rem]" [(selection)]="selectedFiles" />
        </div>
        <app-code></app-code>
    `
})
export class CheckboxDoc implements OnInit {
    private nodeService = inject(NodeService);

    files = signal<TreeNode[]>(undefined);

    selectedFiles!: TreeNode[];

    ngOnInit() {
        this.nodeService.getFiles().then((data) => {
            this.files.set(data);
        });
    }
}
