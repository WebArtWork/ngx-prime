import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component, OnInit, inject } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-speeddial-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, SpeedDialModule, ToastModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div style="height: 500px; position: relative;">
                <p-toast />
                <p-speeddial [model]="items" direction="up" [style]="{ position: 'absolute', left: 'calc(50% - 2rem)', bottom: 0 }" />
            </div>
        </app-docptviewer>
    `,
    providers: [MessageService]
})
export class PTViewer implements OnInit {
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
            }
        ];
    }

    docs = [
        {
            data: getPTOptions('SpeedDial'),
            key: 'SpeedDial'
        }
    ];
}
