import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { ImageModule } from '@wawjs/ngx-prime/image';

@Component({
    selector: 'app-image-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, ImageModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-image src="https://primefaces.org/cdn/ngx-prime/images/galleria/galleria1.jpg" alt="Image" width="250" [preview]="true"></p-image>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Image'),
            key: 'Image'
        }
    ];
}
