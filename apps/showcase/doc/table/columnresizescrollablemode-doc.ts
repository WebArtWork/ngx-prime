import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { Customer } from '@/domain/customer';
import { CustomerService } from '@/service/customerservice';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-columnresizescrollablemode-doc',
    standalone: true,
    imports: [TableModule, AppCode, DeferredDemo],
    template: ` <app-p-deferred-demo (load)="loadDemoData()">
            <div class="card">
                <p-table [value]="customers" showGridlines [scrollable]="true" scrollHeight="400px" [resizableColumns]="true" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #header>
                        <tr>
                            <th pResizableColumn>Name</th>
                            <th pResizableColumn>Country</th>
                            <th pResizableColumn>Company</th>
                            <th pResizableColumn>Representative</th>
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
            </div>
        </app-p-deferred-demo>
        <app-code></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnResizeScrollableModeDoc {
    private customerService = inject(CustomerService);
    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    loadDemoData() {
        this.customerService.getCustomersLarge().then((customers) => {
            this.customers = customers;
            this.cd.markForCheck();
        });
    }
}
