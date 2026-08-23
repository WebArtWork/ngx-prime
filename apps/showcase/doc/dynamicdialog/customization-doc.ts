import { Code } from '@/domain/code';
import { Component, inject } from '@angular/core';
import { DialogService, DynamicDialogRef } from '@wawjs/ngx-prime/dynamicdialog';
import { ProductListDemo } from './productlistdemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-customization-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, RouterModule],
    template: `
        <app-docsectiontext>
            <p>DynamicDialog uses the Dialog component internally, visit <a [routerLink]="'/dialog'">dialog</a> for more information about the available props.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `,
    providers: [DialogService]
})
export class CustomizationDoc {
    dialogService = inject(DialogService);

    ref: DynamicDialogRef | undefined;

    show() {
        this.ref = this.dialogService.open(ProductListDemo, {
            header: 'Select a Product',
            width: '50vw',
            modal: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });
    }

    code: Code = {
        typescript: `
import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from '@wawjs/ngx-prime/dynamicdialog';
import { ProductListDemo } from './productlistdemo';
import { ButtonModule } from '@wawjs/ngx-prime/button';

@Component({
    template: \`<p-button (click)="show()" label="Show" />\`,
    imports: [ButtonModule],
    providers: [DialogService]
})
export class CustomizationDemo {

    ref: DynamicDialogRef | undefined;

    constructor(public dialogService: DialogService) {}

    show() {
        this.ref = this.dialogService.open(ProductListDemo, {
            header: 'Select a Product',
            width: '50vw',
            modal: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
        });
    }
}`
    };
}
