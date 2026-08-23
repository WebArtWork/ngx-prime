import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from '@wawjs/ngx-prime/api';
import { RadioButtonModule } from '@wawjs/ngx-prime/radiobutton';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { ToastModule } from '@wawjs/ngx-prime/toast';
import { MessageModule } from '@wawjs/ngx-prime/message';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-templatedrivenforms-doc',
    standalone: true,
    imports: [FormsModule, RadioButtonModule, ButtonModule, ToastModule, MessageModule, AppCode, AppDocSectionText],
    providers: [MessageService],
    template: `
        <app-docsectiontext> </app-docsectiontext>
        <p-toast />
        <div class="card flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4">
                <div class="flex flex-wrap gap-4">
                    @for (category of categories; track category.name) {
                        <div class="flex items-center gap-2">
                            <p-radiobutton [(ngModel)]="ingredient" [inputId]="category.key" [value]="category" [invalid]="isInvalid(exampleForm)" name="ingredient" />
                            <label [for]="category.key"> {{ category.name }} </label>
                        </div>
                    }
                </div>
                @if (isInvalid(exampleForm)) {
                    <p-message severity="error" size="small" variant="simple"> At least one ingredient must be selected. </p-message>
                }

                <button pButton severity="secondary" type="submit">
                    <span pButtonLabel>Submit</span>
                </button>
            </form>
        </div>

        <app-code></app-code>
    `
})
export class TemplateDrivenFormsDoc {
    messageService = inject(MessageService);

    formSubmitted: boolean = false;

    ingredient!: any;

    categories: any[] = [
        { name: 'Cheese', key: 'C' },
        { name: 'Mushroom', key: 'M' },
        { name: 'Pepper', key: 'P' },
        { name: 'Onion', key: 'O' }
    ];

    isInvalid(form: NgForm) {
        return !this.ingredient && form.submitted;
    }

    onSubmit(form: NgForm) {
        if (!this.isInvalid(form)) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
            form.resetForm();
        }
    }
}
