import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component, OnInit, inject } from '@angular/core';
import { ConfirmationService } from '@wawjs/ngx-prime/api';
import { ConfirmDialogModule } from '@wawjs/ngx-prime/confirmdialog';

@Component({
    selector: 'app-confirmdialog-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `
        <app-docptviewer [docs]="docs">
            <span style="visiblity: hidden;" #anchorElement></span>
            <p-confirmdialog [style]="{ width: '25rem' }" maskStyleClass="!relative !rounded-[2rem]" styleClass="!relative" [draggable]="false" [appendTo]="anchorElement" [autoZIndex]="false" [baseZIndex]="2" [modal]="false"></p-confirmdialog>
        </app-docptviewer>
    `
})
export class PTViewer implements OnInit {
    private confirmationService = inject(ConfirmationService);

    docs = [
        {
            data: getPTOptions('ConfirmDialog'),
            key: 'ConfirmDialog'
        }
    ];

    ngOnInit() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Save'
            }
        });
    }
}
