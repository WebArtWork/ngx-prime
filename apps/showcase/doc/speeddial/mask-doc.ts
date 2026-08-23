import { Component, OnInit, inject } from '@angular/core';
import { MenuItem, MessageService } from '@wawjs/ngx-prime/api';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';
import { SpeedDialModule } from '@wawjs/ngx-prime/speeddial';
import { ToastModule } from '@wawjs/ngx-prime/toast';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-mask-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, SpeedDialModule, ToastModule, RouterModule],
    template: `
        <app-docsectiontext>
            <p>Adding <i>mask</i> property displays a modal layer behind the popup items.</p>
        </app-docsectiontext>
        <div class="card p-4">
            <div [style]="{ position: 'relative', height: '350px' }">
                <p-toast />
                <p-speeddial [model]="items" direction="up" mask [style]="{ position: 'absolute', right: '1rem', bottom: '1rem' }" />
            </div>
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class MaskDoc implements OnInit {
    private messageService = inject(MessageService);

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                icon: 'pi pi-pencil',
                command: () => {
                    this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
                }
            },
            {
                icon: 'pi pi-refresh',
                command: () => {
                    this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
                }
            },
            {
                icon: 'pi pi-trash',
                command: () => {
                    this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
                }
            },
            {
                icon: 'pi pi-upload',
                routerLink: ['/fileupload']
            },
            {
                icon: 'pi pi-external-link',
                target: '_blank',
                url: 'https://angular.dev'
            }
        ];
    }
}
