import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FileUploadModule } from 'ngx-prime/fileupload';

@Component({
    selector: 'app-fileupload-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, FileUploadModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div class="w-full">
                <p-fileupload name="demo[]" url="https://www.primefaces.org/cdn/api/upload.php" [multiple]="true" accept="image/*" [maxFileSize]="1000000">
                    <ng-template #empty>
                        <span>Drag and drop files to here to upload.</span>
                    </ng-template>
                </p-fileupload>
            </div>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('FileUpload'),
            key: 'FileUpload'
        }
    ];
}
