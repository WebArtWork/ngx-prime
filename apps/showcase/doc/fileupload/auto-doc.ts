import { Component, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { FileUploadModule } from '@wawjs/ngx-prime/fileupload';
import { ToastModule } from '@wawjs/ngx-prime/toast';

@Component({
    selector: 'app-auto-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FileUploadModule, ToastModule],
    template: `
        <app-docsectiontext>
            <p>When <i>auto</i> property is enabled, a file gets uploaded instantly after selection.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-toast />
            <p-fileupload mode="basic" name="demo[]" chooseIcon="pi pi-upload" url="https://www.primefaces.org/cdn/api/upload.php" accept="image/*" maxFileSize="1000000" (onUpload)="onBasicUploadAuto()" [auto]="true" chooseLabel="Browse" />
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class AutoDoc {
    private messageService = inject(MessageService);

    onBasicUploadAuto() {
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Auto Mode' });
    }
}
