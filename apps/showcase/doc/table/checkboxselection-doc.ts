import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from '@wawjs/ngx-prime/table';

@Component({
    selector: 'app-checkboxselection-doc',
    standalone: true,
    imports: [FormsModule, TableModule, AppDocSectionText, AppCode, DeferredDemo],
    template: ` <app-docsectiontext>
            <p>Multiple selection can also be handled using checkboxes by enabling the <i>selectionMode</i> property of column as <i>multiple</i>.</p>
        </app-docsectiontext>
        <app-p-deferred-demo (demoLoad)="loadDemoData()">
            <div class="card">
                <p-table [value]="products" [(selection)]="selectedProducts" dataKey="code" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #header>
                        <tr>
                            <th style="width: 4rem">
                                <p-tableHeaderCheckbox />
                            </th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-product>
                        <tr>
                            <td>
                                <p-tableCheckbox [value]="product" />
                            </td>
                            <td>{{ product.code }}</td>
                            <td>{{ product.name }}</td>
                            <td>{{ product.category }}</td>
                            <td>{{ product.quantity }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </app-p-deferred-demo>
        <app-code [extFiles]="['Product']"></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxSelectionDoc {
    private productService = inject(ProductService);
    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    selectedProducts!: Product;

    loadDemoData() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
            this.cd.markForCheck();
        });
    }
}
