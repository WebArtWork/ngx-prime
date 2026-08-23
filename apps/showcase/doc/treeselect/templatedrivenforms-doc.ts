import { NodeService } from '@/service/nodeservice';
import { Component, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { FormsModule } from '@angular/forms';

import { TreeSelectModule } from '@wawjs/ngx-prime/treeselect';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { ToastModule } from '@wawjs/ngx-prime/toast';
import { MessageModule } from '@wawjs/ngx-prime/message';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-templatedrivenforms-doc',
    standalone: true,
    imports: [FormsModule, TreeSelectModule, ButtonModule, ToastModule, MessageModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext> </app-docsectiontext>
        <p-toast />
        <div class="card flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4 w-full md:w-80">
                <div class="flex flex-col gap-1">
                    <p-treeselect #node="ngModel" [(ngModel)]="selectedNodes" [invalid]="node.invalid && exampleForm.submitted" name="node" class="md:w-80 w-full" [options]="nodes" placeholder="Select Item" required />
                    @if (node.invalid && exampleForm.submitted) {
                        <p-message severity="error" size="small" variant="simple">Selection is required.</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit"><span pButtonLabel>Submit</span></button>
            </form>
        </div>
        <app-code></app-code>
    `
})
export class TemplateDrivenFormsDoc {
    private nodeService = inject(NodeService);

    messageService = inject(MessageService);

    selectedNodes: any;

    nodes!: any[];

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }

    onSubmit(form: any) {
        if (form.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
            form.resetForm();
        }
    }
}
