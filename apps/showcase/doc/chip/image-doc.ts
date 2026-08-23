import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChipModule } from '@wawjs/ngx-prime/chip';

@Component({
    selector: 'app-image-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, ChipModule],
    template: `
        <app-docsectiontext>
            <p>The <i>image</i> property is used to display an image like an avatar.</p>
        </app-docsectiontext>
        <div class="card flex items-center gap-2 flex-wrap">
            <p-chip label="Amy Elsner" image="https://primefaces.org/cdn/ngx-prime/images/demo/avatar/amyelsner.png" alt="Avatar image" />
            <p-chip label="Asiya Javayant" image="https://primefaces.org/cdn/ngx-prime/images/demo/avatar/asiyajavayant.png" alt="Avatar image" />
            <p-chip label="Onyama Limba" image="https://primefaces.org/cdn/ngx-prime/images/demo/avatar/onyamalimba.png" alt="Avatar image" />
            <p-chip label="Xuxue Feng" image="https://primefaces.org/cdn/ngx-prime/images/demo/avatar/xuxuefeng.png" alt="Avatar image" [removable]="true" />
        </div>
        <app-code></app-code>
    `
})
export class ImageDoc {}
