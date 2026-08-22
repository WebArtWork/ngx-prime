import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component, inject } from '@angular/core';
import { ConfirmationService } from 'ngx-prime/api';
import { ButtonModule } from 'ngx-prime/button';
import { ConfirmPopupModule } from 'ngx-prime/confirmpopup';

@Component({
    selector: 'app-confirmpopup-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ConfirmPopupModule, ButtonModule],
    providers: [ConfirmationService],
    template: `
        <app-docptviewer [docs]="docs">
            <p-confirmpopup />
            <p-button (onClick)="confirm($event)" label="Open Popup" outlined></p-button>
        </app-docptviewer>
    `
})
export class PTViewer {
    private confirmationService = inject(ConfirmationService);

    confirm(event: Event) {
        this.confirmationService.confirm({
            target: event.currentTarget as EventTarget,
            message: 'Are you sure you want to proceed?',
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

    docs = [
        {
            data: getPTOptions('ConfirmPopup'),
            key: 'ConfirmPopup'
        }
    ];
}
