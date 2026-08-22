import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TreeNode } from 'ngx-prime/api';
import { TreeModule } from 'ngx-prime/tree';

@Component({
    selector: 'app-virtualscroll-doc',
    standalone: true,
    imports: [TreeModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>VirtualScroller is a performance-approach to handle huge data efficiently. Setting <i>virtualScroll</i> property as true and providing a <i>virtualScrollItemSize</i> in pixels would be enough to enable this functionality.</p>
        </app-docsectiontext>
        <div class="card">
            <p-tree [value]="nodes()" scrollHeight="250px" [virtualScroll]="true" [virtualScrollItemSize]="35" />
        </div>
        <app-code></app-code>
    `
})
export class VirtualScrollDoc implements OnInit {
    private nodeService = inject(NodeService);

    nodes = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodes.set(this.nodeService.generateNodes(150));
    }
}
