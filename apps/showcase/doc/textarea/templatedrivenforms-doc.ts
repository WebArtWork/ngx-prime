import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@wawjs/ngx-prime/api';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { MessageModule } from '@wawjs/ngx-prime/message';
import { TextareaModule } from '@wawjs/ngx-prime/textarea';
import { ToastModule } from '@wawjs/ngx-prime/toast';

@Component({
    selector: 'app-templatedrivenforms-doc',
    standalone: true,
    imports: [FormsModule, AppCode, AppDocSectionText, ButtonModule, MessageModule, TextareaModule, ToastModule],
    template: `
        <app-docsectiontext> </app-docsectiontext>
        <p-toast />
        <div class="card flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <textarea name="address" #address="ngModel" rows="5" cols="30" [(ngModel)]="value" pTextarea [invalid]="address.invalid && (address.touched || exampleForm.submitted)" required></textarea>
                    @if (address.invalid && (address.touched || exampleForm.submitted)) {
                        <p-message severity="error" size="small" variant="simple">Address is required.</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit"><span pButtonLabel>Submit</span></button>
            </form>
        </div>
        <app-code></app-code>
    `
})
export class TemplateDrivenFormsDoc {
    messageService = inject(MessageService);

    items: any[] = [];

    value: any;

    onSubmit(form: any) {
        if (form.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form is submitted', life: 3000 });
            form.resetForm();
        }
    }
}
