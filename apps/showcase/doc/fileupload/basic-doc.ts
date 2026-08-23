import { Component, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { FileUploadModule } from '@wawjs/ngx-prime/fileupload';
import { ToastModule } from '@wawjs/ngx-prime/toast';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [FileUploadModule, ToastModule, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>FileUpload basic <i>mode</i> provides a simpler UI as an alternative to default advanced mode.</p>
        </app-docsectiontext>
        <p-toast />
        <div class="card flex flex-wrap gap-6 items-center justify-between">
            <p-fileupload #fu mode="basic" chooseLabel="Choose" chooseIcon="pi pi-upload" name="demo[]" url="https://www.primefaces.org/cdn/api/upload.php" accept="image/*" maxFileSize="1000000" (onUpload)="onUpload()" />
            <p-button label="Upload" (onClick)="fu.upload()" severity="secondary" />
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class BasicDoc {
    private messageService = inject(MessageService);

    onUpload() {
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
    }
}
