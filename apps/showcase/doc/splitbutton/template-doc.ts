import { Component, inject } from '@angular/core';
import { MenuItem, MessageService } from 'ngx-prime/api';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SplitButtonModule } from 'ngx-prime/splitbutton';
import { ToastModule } from 'ngx-prime/toast';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-template-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, SplitButtonModule, ToastModule, RouterModule],
    template: `
        <app-docsectiontext>
            <p>SplitButton has a default action button and a collection of additional options defined by the <i>model</i> property based on MenuModel API.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-toast />
            <p-splitbutton label="Save" (onClick)="save()" severity="contrast" [model]="items">
                <ng-template #content>
                    <span class="flex items-center font-bold">
                        <img alt="logo" src="https://primefaces.org/cdn/ngx-prime/images/logo.svg" style="height: 1rem; margin-right: 0.5rem" />
                        <span>ngx-prime</span>
                    </span>
                </ng-template>
            </p-splitbutton>
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class TemplateDoc {
    private messageService = inject(MessageService);

    items: MenuItem[];

    constructor() {
        this.items = [
            {
                label: 'Update',
                command: () => {
                    this.update();
                }
            },
            {
                label: 'Delete',
                command: () => {
                    this.delete();
                }
            },
            { label: 'Angular.dev', url: 'https://angular.dev' },
            { separator: true },
            { label: 'Upload', routerLink: ['/fileupload'] }
        ];
    }

    save() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Saved' });
    }

    update() {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Data Updated' });
    }

    delete() {
        this.messageService.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted' });
    }
}
