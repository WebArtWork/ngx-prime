import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { BlockUIModule } from '@wawjs/ngx-prime/blockui';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-document-doc',
    standalone: true,
    imports: [BlockUIModule, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>If the target element is not specified, BlockUI blocks the document by default.</p>
        </app-docsectiontext>
        <div class="card">
            <p-blockui [blocked]="blockedDocument" />
            <p-button label="Block" (click)="blockDocument()" />
        </div>
        <app-code></app-code>
    `
})
export class DocumentDoc {
    private cd = inject(ChangeDetectorRef);

    blockedDocument: boolean = false;

    blockDocument() {
        this.blockedDocument = true;
        setTimeout(() => {
            this.blockedDocument = false;
            this.cd.markForCheck();
        }, 3000);
    }
}
