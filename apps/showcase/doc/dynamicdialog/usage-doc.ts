import { Code } from '@/domain/code';
import { Component, inject } from '@angular/core';
import { DialogService, DynamicDialogRef } from '@wawjs/ngx-prime/dynamicdialog';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-usage-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>To use dynamic dialog, a reference should be declared as <i>DynamicDialogRef</i> after the <i>DialogService</i> injected into the component.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `,
    providers: [DialogService]
})
export class UsageDoc {
    dialogService = inject(DialogService);

    ref: DynamicDialogRef | undefined;

    code: Code = {
        typescript: `
import { Component, OnDestroy } from '@angular/core';
import { DialogService, DynamicDialogRef } from '@wawjs/ngx-prime/dynamicdialog';
import { Product } from '@/domain/product';
import { ProductListDemo } from './productlistdemo';
import { ButtonModule } from '@wawjs/ngx-prime/button';

@Component({
    template: \`<p-button (click)="show()" label="Show" />\`,
    imports: [ButtonModule],
    providers: [DialogService]
})
export class DynamicDialogDemo implements OnDestroy {

    ref: DynamicDialogRef | undefined;

    constructor(public dialogService: DialogService) {}
}`
    };
}
