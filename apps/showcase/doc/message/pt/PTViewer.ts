import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { MessageModule } from '@wawjs/ngx-prime/message';

@Component({
    selector: 'app-message-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, MessageModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-message [closable]="true" severity="info" icon="pi pi-send">Info Message</p-message>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Message'),
            key: 'Message'
        }
    ];
}
