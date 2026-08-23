import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component, OnInit, signal, inject } from '@angular/core';
import { TreeNode } from '@wawjs/ngx-prime/api';
import { TreeModule } from '@wawjs/ngx-prime/tree';
import { NodeService } from '@/service/nodeservice';

@Component({
    selector: 'app-tree-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, TreeModule],
    providers: [NodeService],
    template: `
        <app-docptviewer [docs]="docs">
            <p-tree [value]="nodes()" [(selection)]="selectedKey" filter selectionMode="checkbox" class="w-full md:w-[30rem]" />
        </app-docptviewer>
    `
})
export class PTViewer implements OnInit {
    private nodeService = inject(NodeService);

    nodes = signal<TreeNode[] | undefined>(undefined);

    selectedKey: any = null;

    docs = [
        {
            data: getPTOptions('Tree'),
            key: 'Tree'
        }
    ];

    ngOnInit() {
        this.nodeService.getTreeNodes().then((data) => this.nodes.set(data));
    }
}
