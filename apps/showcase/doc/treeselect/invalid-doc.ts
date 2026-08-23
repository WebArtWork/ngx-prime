import { NodeService } from '@/service/nodeservice';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from '@wawjs/ngx-prime/treeselect';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-invalid-doc',
    standalone: true,
    imports: [FormsModule, TreeSelectModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>The invalid state is applied using the <i>â invalid</i> property to indicate failed validation, which can be integrated with Angular Forms.</p>
        </app-docsectiontext>
        <div class="card flex flex-wrap justify-center gap-4">
            <p-treeselect [invalid]="selectedValue1 === undefined" [(ngModel)]="selectedValue1" [options]="nodes" placeholder="TreeSelect" class="md:w-80 w-full" />
            <p-treeselect [invalid]="selectedValue2 === undefined" [(ngModel)]="selectedValue2" [options]="nodes" placeholder="TreeSelect" class="md:w-80 w-full" />
        </div>
        <app-code></app-code>
    `
})
export class InvalidDoc {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedValue1: any;

    selectedValue2: any;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }
}
