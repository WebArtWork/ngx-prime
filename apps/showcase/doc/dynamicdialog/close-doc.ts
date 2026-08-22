import { Code } from '@/domain/code';
import { Product } from '@/domain/product';
import { Component, inject } from '@angular/core';
import { MessageService } from 'ngx-prime/api';
import { DialogService, DynamicDialogRef } from 'ngx-prime/dynamicdialog';
import { ProductListDemo } from './productlistdemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-close-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Most of the time, requirement is returning a value from the dialog. DialogRef's close method is used for this purpose where the parameter passed will be available at the <i>onClose</i> event at the caller. Here is an example on how to
                close the dialog from the ProductListDemo by passing a selected product.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `,
    providers: [DialogService, MessageService]
})
export class CloseDoc {
    dialogService = inject(DialogService);
    messageService = inject(MessageService);

    ref: DynamicDialogRef | undefined;

    show() {
        this.ref = this.dialogService.open(ProductListDemo, {
            header: 'Select a Product',
            width: '70%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true
        });

        this.ref.onClose.subscribe((product: Product) => {
            if (product) {
                this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: product.name });
            }
        });
    }

    code: Code = {
        typescript: `
import { Component, Input } from '@angular/core';
import { MessageService } from 'ngx-prime/api';
import { DialogService, DynamicDialogRef } from 'ngx-prime/dynamicdialog';
import { Product } from '@/domain/product';
import { ProductListDemo } from './productlistdemo';
import { ButtonModule } from 'ngx-prime/button';
import { ToastModule } from 'ngx-prime/toast';

@Component({
    template: \`
        <p-toast />
        <p-button (click)="show()" label="Show" />
    \`,
    imports: [ButtonModule, ToastModule],
    providers: [DialogService, MessageService]
})
export class DynamicDialogDemo {

    ref: DynamicDialogRef | undefined;

    constructor(public dialogService: DialogService, public messageService: MessageService) {}

    show() {
        this.ref = this.dialogService.open(ProductListDemo, {
            header: 'Select a Product',
            width: '70%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true
        });

        this.ref.onClose.subscribe((product: Product) => {
            if (product) {
                this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: product.name });
            }
        });
    }
}`
    };
}
