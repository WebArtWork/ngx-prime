import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { NodeService } from '@/service/nodeservice';
import { Component, OnInit, signal, inject } from '@angular/core';
import { TreeNode } from '@wawjs/ngx-prime/api';
import { TreeModule } from '@wawjs/ngx-prime/tree';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [TreeModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Tree component requires an array of <i>TreeNode</i> objects as its <i>value</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <p-tree [value]="files()" class="w-full md:w-[30rem]" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc implements OnInit {
    private nodeService = inject(NodeService);

    files = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodeService.getFiles().then((data) => {
            this.files.set(data);
        });
    }
}
