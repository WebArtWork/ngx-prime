import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FileUploadCancelDirective, FileUploadChooseDirective, FileUploadClearDirective, FileUploadDirective, FileUploadDropZoneDirective, FileUploadQueueDirective, FileUploadUploadDirective } from 'ngx-prime/fileupload';

@Component({
    selector: 'app-fileupload-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FileUploadDirective, FileUploadClearDirective, FileUploadQueueDirective, FileUploadChooseDirective, FileUploadUploadDirective, FileUploadCancelDirective, FileUploadDropZoneDirective],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>pFileUpload</i> on a native <i>input type="file"</i> when the application owns the upload flow. It exposes selected files through a two-way <i>value</i> model and native file attributes such as <i>accept</i> and
                <i>multiple</i>.
            </p>
            <p>Compose <i>pFileUploadQueue</i> with choose, upload, cancel, clear and drop-zone directives for browser-native upload transport. The layout, preview, and file-list markup remain entirely yours.</p>
        </app-docsectiontext>
        <div class="card flex flex-wrap items-center gap-3">
            <input #uploader="pFileUpload" type="file" pFileUpload [(value)]="files" multiple accept="image/*" maxFileSize="1000000" aria-label="Choose images" />
            <div #queue="pFileUploadQueue" class="contents" [pFileUploadQueue]="uploader" url="https://www.primefaces.org/cdn/api/upload.php">
                <button pFileUploadChoose [pFileUploadChoose]="queue">Choose</button>
                <button pFileUploadUpload [pFileUploadUpload]="queue">Upload</button>
                <button pFileUploadCancel [pFileUploadCancel]="queue">Cancel</button>
                <button pFileUploadClear [pFileUploadClear]="uploader" (click)="queue.clear()">Clear</button>
                <div pFileUploadDropZone [pFileUploadDropZone]="queue" class="w-full border-1 border-dashed border-surface-300 p-3">Drop files here</div>
                @if (queue.files().length) {
                    <span>{{ queue.files().length }} file(s) queued</span>
                }
            </div>
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    files: File[] = [];
}
