import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Customer } from '@/domain/customer';
import { CustomerService } from '@/service/customerservice';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { RippleModule } from '@wawjs/ngx-prime/ripple';
import { TableModule } from '@wawjs/ngx-prime/table';
import { TagModule } from '@wawjs/ngx-prime/tag';

@Component({
    selector: 'app-expandablerowgroup-doc',
    standalone: true,
    imports: [TableModule, ButtonModule, RippleModule, TagModule, AppDocSectionText, AppCode, DeferredDemo],
    template: ` <app-docsectiontext>
            <p>When <i>expandableRowGroups</i> is present in subheader based row grouping, groups can be expanded and collapsed. State of the expansions are controlled using the <i>expandedRows</i> and <i>onRowToggle</i> properties.</p>
        </app-docsectiontext>
        <app-p-deferred-demo (demoLoad)="loadDemoData()">
            <div class="card">
                <p-table [value]="customers" sortField="representative.name" sortMode="single" dataKey="representative.name" rowGroupMode="subheader" groupRowsBy="representative.name" [tableStyle]="{ 'min-width': '70rem' }">
                    <ng-template #header>
                        <tr>
                            <th style="width:20%">Name</th>
                            <th style="width:20%">Country</th>
                            <th style="width:20%">Company</th>
                            <th style="width:20%">Status</th>
                            <th style="width:20%">Date</th>
                        </tr>
                    </ng-template>
                    <ng-template #groupheader let-customer let-rowIndex="rowIndex" let-expanded="expanded">
                        <tr>
                            <td colspan="5">
                                <button type="button" pButton pRipple [pRowToggler]="customer" text rounded plain class="mr-2" [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></button>
                                <img [alt]="customer.representative.name" src="https://primefaces.org/cdn/ngx-prime/images/demo/avatar/{{ customer.representative.image }}" width="32" style="vertical-align: middle; display: inline-block" />
                                <span class="font-bold ml-2">{{ customer.representative.name }}</span>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #groupfooter let-customer>
                        <tr class="p-rowgroup-footer">
                            <td colspan="4" style="text-align: right">Total Customers</td>
                            <td>{{ calculateCustomerTotal(customer.representative.name) }}</td>
                        </tr>
                    </ng-template>
                    <ng-template #expandedrow let-customer>
                        <tr>
                            <td>
                                {{ customer.name }}
                            </td>
                            <td>
                                <div class="flex items-center gap-2">
                                    <img src="https://primefaces.org/cdn/ngx-prime/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + customer.country.code" style="width: 20px" />
                                    <span>{{ customer.country.name }}</span>
                                </div>
                            </td>
                            <td>
                                {{ customer.company }}
                            </td>
                            <td>
                                <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                            </td>
                            <td>
                                {{ customer.date }}
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </app-p-deferred-demo>
        <app-code [extFiles]="['Customer']"></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandableRowGroupDoc {
    private customerService = inject(CustomerService);
    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    loadDemoData() {
        this.customerService.getCustomersMedium().then((data) => {
            this.customers = data;
            this.cd.markForCheck();
        });
    }

    calculateCustomerTotal(name: string) {
        let total = 0;

        if (this.customers) {
            for (let customer of this.customers) {
                if (customer.representative?.name === name) {
                    total++;
                }
            }
        }

        return total;
    }

    getSeverity(status: string) {
        switch (status) {
            case 'unqualified':
                return 'danger';

            case 'qualified':
                return 'success';

            case 'new':
                return 'info';

            case 'negotiation':
                return 'warn';

            case 'renewal':
                return null;
        }
    }
}
