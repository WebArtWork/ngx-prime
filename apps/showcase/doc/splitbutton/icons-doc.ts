import { Component, inject } from '@angular/core';
import { MenuItem, MessageService } from 'ngx-prime/api';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SplitButtonModule } from 'ngx-prime/splitbutton';
import { ToastModule } from 'ngx-prime/toast';

@Component({
    selector: 'app-icons-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, SplitButtonModule, ToastModule],
    template: `
        <app-docsectiontext>
            <p>The buttons and menuitems have support to display icons.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-toast />
            <p-splitbutton label="Save" icon="pi pi-check" dropdownIcon="pi pi-cog" [model]="items" />
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class IconsDoc {
    private messageService = inject(MessageService);

    items: MenuItem[];

    constructor() {
        this.items = [
            {
                label: 'Update',
                icon: 'pi pi-refresh',
                command: () => {
                    this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
                }
            },
            {
                label: 'Delete',
                icon: 'pi pi-times',
                command: () => {
                    this.messageService.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
                }
            },
            {
                separator: true
            },
            {
                label: 'Quit',
                icon: 'pi pi-power-off',
                command: () => {
                    window.open('https://angular.io/', '_blank');
                }
            }
        ];
    }
}
