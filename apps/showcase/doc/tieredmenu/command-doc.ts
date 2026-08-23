import { Component, OnInit, inject } from '@angular/core';
import { MenuItem, MessageService } from '@wawjs/ngx-prime/api';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';
import { TieredMenuModule } from '@wawjs/ngx-prime/tieredmenu';
import { ToastModule } from '@wawjs/ngx-prime/toast';

@Component({
    selector: 'app-command-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, TieredMenuModule, ToastModule],
    providers: [MessageService],
    template: `
        <app-docsectiontext>
            <p>The <i>command</i> property defines the callback to run when an item is activated by click or a key event.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-toast />
            <p-tieredmenu [model]="items" />
        </div>
        <app-code></app-code>
    `
})
export class CommandDoc implements OnInit {
    private messageService = inject(MessageService);

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'File',
                icon: 'pi pi-file',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-plus',
                        command: () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File created', life: 3000 });
                        }
                    },
                    {
                        label: 'Print',
                        icon: 'pi pi-print',
                        command: () => {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No printer connected', life: 3000 });
                        }
                    }
                ]
            },
            {
                label: 'Search',
                icon: 'pi pi-search',
                command: () => {
                    this.messageService.add({ severity: 'warn', summary: 'Search Results', detail: 'No results found', life: 3000 });
                }
            },
            {
                separator: true
            },
            {
                label: 'Sync',
                icon: 'pi pi-cloud',
                items: [
                    {
                        label: 'Import',
                        icon: 'pi pi-cloud-download',
                        command: () => {
                            this.messageService.add({
                                severity: 'info',
                                summary: 'Downloads',
                                detail: 'Downloaded from cloud',
                                life: 3000
                            });
                        }
                    },
                    {
                        label: 'Export',
                        icon: 'pi pi-cloud-upload',
                        command: () => {
                            this.messageService.add({ severity: 'info', summary: 'Shared', detail: 'Exported to cloud', life: 3000 });
                        }
                    }
                ]
            }
        ];
    }
}
