import { Component } from '@angular/core';
import { InplaceModule } from 'ngx-prime/inplace';
import { InputTextModule } from 'ngx-prime/inputtext';
import { AutoFocusModule } from 'ngx-prime/autofocus';
import { ButtonModule } from 'ngx-prime/button';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-input-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCodeModule, InplaceModule, InputTextModule, AutoFocusModule, ButtonModule],
    template: `
        <app-docsectiontext>
            <p>The <i>closeCallback</i> switches the state back to display mode when called from an event.</p>
        </app-docsectiontext>
        <div class="card">
            <p-inplace>
                <ng-template #display>
                    <span>Click to Edit</span>
                </ng-template>
                <ng-template #content let-closeCallback="closeCallback">
                    <span class="inline-flex gap-2">
                        <input type="text" pInputText [pAutoFocus]="true" />
                        <button type="button" pButton (click)="closeCallback($event)" text severity="danger">
                            <i class="pi pi-times" pButtonIcon></i>
                        </button>
                    </span>
                </ng-template>
            </p-inplace>
        </div>
        <app-code></app-code>
    `
})
export class InputDoc {}
