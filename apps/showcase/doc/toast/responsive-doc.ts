import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { ToastModule } from '@wawjs/ngx-prime/toast';

@Component({
    selector: 'app-responsive-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ToastModule, ButtonModule],
    template: `
        <app-docsectiontext>
            <p>
                Toast styling can be adjusted per screen size with the <i>breakpoints</i> option. The value of <i>breakpoints</i>
                should be an object literal whose keys are the maximum screen sizes and values are the styles per screen.
            </p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-toast [breakpoints]="{ '920px': { width: '50%', right: 'auto' } }" />
            <p-button (click)="show()" label="Show" />
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class ResponsiveDoc {
    private messageService = inject(MessageService);

    show() {
        this.messageService.add({ severity: 'contrast', summary: 'Success', detail: 'Message Content' });
    }
}
