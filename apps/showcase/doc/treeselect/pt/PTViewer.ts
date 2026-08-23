import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeNode } from '@wawjs/ngx-prime/api';
import { TreeSelectModule } from '@wawjs/ngx-prime/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    selector: 'app-treeselect-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, TreeSelectModule, FormsModule],
    providers: [NodeService],
    template: `
        <app-docptviewer [docs]="docs">
            <p-treeselect [(ngModel)]="selectedNodes" [options]="nodes" selectionMode="checkbox" [filter]="true" [showClear]="true" placeholder="Select Item" class="md:w-80 w-full"> </p-treeselect>
        </app-docptviewer>
    `
})
export class PTViewer implements OnInit {
    private nodeService = inject(NodeService);

    selectedNodes: TreeNode | null = null;

    nodes: TreeNode[] | undefined;

    docs = [{ data: getPTOptions('TreeSelect'), key: 'TreeSelect' }];

    ngOnInit() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
