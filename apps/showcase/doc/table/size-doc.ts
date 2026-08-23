import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from '@wawjs/ngx-prime/selectbutton';
import { TableModule } from '@wawjs/ngx-prime/table';

@Component({
    selector: 'app-size-doc',
    standalone: true,
    imports: [FormsModule, TableModule, SelectButtonModule, AppDocSectionText, AppCode, DeferredDemo],
    template: ` <app-docsectiontext>
            <p>In addition to a regular table, alternatives with alternative sizes are available.</p>
        </app-docsectiontext>
        <app-p-deferred-demo (demoLoad)="loadDemoData()">
            <div class="card">
                <div class="flex justify-center mb-4">
                    <p-selectbutton [options]="sizes" [(ngModel)]="selectedSize" [multiple]="false" optionLabel="name" optionValue="value" />
                </div>
                <p-table [value]="products" [tableStyle]="{ 'min-width': '50rem' }" [size]="selectedSize">
                    <ng-template #header>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
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
export class SizeDoc {
    private productService = inject(ProductService);
    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    sizes!: any[];

    selectedSize: any = undefined;

    loadDemoData() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
            this.cd.markForCheck();
        });

        this.sizes = [
            { name: 'Small', value: 'small' },
            { name: 'Normal', value: undefined },
            { name: 'Large', value: 'large' }
        ];
    }
}
