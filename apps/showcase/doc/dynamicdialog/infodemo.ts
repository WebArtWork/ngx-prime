import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ButtonModule } from 'ngx-prime/button';
import { DialogService, DynamicDialog, DynamicDialogRef } from 'ngx-prime/dynamicdialog';

@Component({
    standalone: true,
    imports: [ButtonModule],
    template: `
        <div>
            <p>
                There are <strong>{{ totalProducts }}</strong> products in total in this list.
            </p>
            <div class="flex justify-end">
                <p-button type="button" label="Close" (click)="close()"></p-button>
            </div>
        </div>
    `
})
export class InfoDemo implements OnInit, OnDestroy {
    ref = inject(DynamicDialogRef);
    private dialogService = inject(DialogService);

    totalProducts: number = 0;

    instance: DynamicDialog | undefined;

    constructor() {
        this.instance = this.dialogService.getInstance(this.ref);
    }

    ngOnInit() {
        if (this.instance && this.instance.data) {
            this.totalProducts = this.instance.data['totalProducts'];
        }
    }

    close() {
        this.ref.close();
    }

    ngOnDestroy() {
        if (this.ref) {
            this.ref.close();
        }
    }
}
