import { Component, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';
import { ToastModule } from '@wawjs/ngx-prime/toast';
import { ButtonModule } from '@wawjs/ngx-prime/button';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ToastModule, ButtonModule],
    template: `
        <app-docsectiontext>
            <p>
                Toasts are displayed by calling the <i>add</i> and <i>addAll</i> method provided by the <i>messageService</i>. A single toast is specified by the <i>Message</i> interface that defines various properties such as <i>severity</i>,
                <i>summary</i> and <i>detail</i>.
            </p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-toast />
            <p-button (onClick)="show()" label="Show" />
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class BasicDoc {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
    }
}
