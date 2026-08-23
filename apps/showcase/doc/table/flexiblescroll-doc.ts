import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Customer } from '@/domain/customer';
import { CustomerService } from '@/service/customerservice';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { DialogModule } from '@wawjs/ngx-prime/dialog';
import { TableModule } from '@wawjs/ngx-prime/table';

@Component({
    selector: 'app-flexiblescroll-doc',
    standalone: true,
    imports: [TableModule, ButtonModule, DialogModule, AppDocSectionText, AppCode, DeferredDemo],
    template: ` <app-docsectiontext>
            <p>
                Flex scroll feature makes the scrollable viewport section dynamic instead of a fixed value so that it can grow or shrink relative to the parent size of the table. Click the button below to display a maximizable Dialog where data
                viewport adjusts itself according to the size changes.
            </p>
        </app-docsectiontext>
        <app-p-deferred-demo (demoLoad)="loadDemoData()">
            <div class="card">
                <div class="flex justify-center">
                    <button type="button" (click)="showDialog()" pButton icon="pi pi-external-link" label="Show"></button>
                </div>
                <p-dialog header="Header" [resizable]="false" [modal]="true" [maximizable]="true" appendTo="body" [(visible)]="dialogVisible" [style]="{ width: '75vw' }" [contentStyle]="{ height: '300px' }">
                    <p-table [value]="customers" [scrollable]="true" scrollHeight="flex" [tableStyle]="{ 'min-width': '50rem' }">
                        <ng-template #header>
                            <tr>
                                <th>Name</th>
                                <th>Country</th>
                                <th>Company</th>
                                <th>Representative</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-customer>
                            <tr>
                                <td>{{ customer.name }}</td>
                                <td>{{ customer.country.name }}</td>
                                <td>{{ customer.company }}</td>
                                <td>{{ customer.representative.name }}</td>
                            </tr>
                        </ng-template>
                    </p-table>
                    <ng-template #footer>
                        <p-button label="Ok" icon="pi pi-check" (onClick)="dialogVisible = false" />
                    </ng-template>
                </p-dialog>
            </div>
        </app-p-deferred-demo>
        <app-code [extFiles]="['Customer']"></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlexibleScrollDoc {
    private customerService = inject(CustomerService);
    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    dialogVisible: boolean = false;

    loadDemoData() {
        this.customerService.getCustomersMedium().then((data) => {
            this.customers = data;
        });
    }

    showDialog() {
        this.dialogVisible = true;
    }
}
