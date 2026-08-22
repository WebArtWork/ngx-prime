import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'ngx-prime/password';

@Component({
    selector: 'app-password-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, PasswordModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-password [(ngModel)]="value" [toggleMask]="true"></p-password>
        </app-docptviewer>
    `
})
export class PTViewer {
    value: string | null = null;

    docs = [
        {
            data: getPTOptions('Password'),
            key: 'Password'
        }
    ];
}
