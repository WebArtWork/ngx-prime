import { Component, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { FileUploadModule } from '@wawjs/ngx-prime/fileupload';
import { ToastModule } from '@wawjs/ngx-prime/toast';

@Component({
    selector: 'app-custom-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FileUploadModule, ToastModule],
    template: `
        <app-docsectiontext>
            <p>FileUpload basic <i>mode</i> provides a simpler UI as an alternative to default advanced mode.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-toast></p-toast>
            <p-fileupload name="myfile[]" [customUpload]="true" (uploadHandler)="customUploader($event)"></p-fileupload>
        </div>
        <app-code></app-code>
    `,
    providers: [MessageService]
})
export class CustomDoc {
    private messageService = inject(MessageService);

    async customUploader(event) {
        const file = event.files[0];
        const reader = new FileReader();
        let blob = await fetch(file.objectURL).then((r) => r.blob()); //blob:url

        reader.readAsDataURL(blob);

        reader.onloadend = function () {
            void reader.result;
        };

        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
    }
}
