import { Component, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from '@wawjs/ngx-prime/inputnumber';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { ToastModule } from '@wawjs/ngx-prime/toast';
import { MessageModule } from '@wawjs/ngx-prime/message';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-templatedrivenforms-doc',
    standalone: true,
    imports: [FormsModule, InputNumberModule, ButtonModule, ToastModule, MessageModule, AppCodeModule, AppDocSectionText],
    template: `
        <app-docsectiontext></app-docsectiontext>
        <p-toast />
        <div class="card flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <p-inputnumber inputId="integeronly" #inputValue="ngModel" name="inputValue" [(ngModel)]="value" [invalid]="inputValue.invalid && (inputValue.touched || exampleForm.submitted)" required />
                    @if (inputValue.invalid && (inputValue.touched || exampleForm.submitted)) {
                        <p-message severity="error" size="small" variant="simple">Number is required.</p-message>
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

    value: any;

    onSubmit(form: any) {
        if (form.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
            form.resetForm();
        }
    }
}
