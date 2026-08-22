import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { TableModule } from 'ngx-prime/table';

@Component({
    selector: 'app-columnresizeexpandmode-doc',
    standalone: true,
    imports: [TableModule, AppDocSectionText, AppCode, DeferredDemo],
    template: ` <app-docsectiontext>
            <p>Setting <i>columnResizeMode</i> as <i>expand</i> changes the table width as well.</p>
        </app-docsectiontext>
        <app-p-deferred-demo (demoLoad)="loadDemoData()">
            <div class="card">
                <p-table [value]="products" showGridlines [resizableColumns]="true" columnResizeMode="expand" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #header>
                        <tr>
                            <th pResizableColumn>Code</th>
                            <th pResizableColumn>Name</th>
                            <th pResizableColumn>Category</th>
                            <th pResizableColumn>Quantity</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-product>
                        <tr>
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
export class ColumnResizeExpandModeDoc {
    private productService = inject(ProductService);
    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    loadDemoData() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
            this.cd.markForCheck();
        });
    }
}
