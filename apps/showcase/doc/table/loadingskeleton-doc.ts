import { DeferredDemo } from '@/components/demo/deferreddemo';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Product } from '@/domain/product';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { SkeletonModule } from '@wawjs/ngx-prime/skeleton';
import { TableModule } from '@wawjs/ngx-prime/table';

@Component({
    selector: 'app-loadingskeleton-doc',
    standalone: true,
    imports: [TableModule, AppDocSectionText, AppCode, DeferredDemo, SkeletonModule],
    template: ` <app-docsectiontext>
            <p>Skeleton component can be used as a placeholder during the loading process.</p>
        </app-docsectiontext>
        <app-p-deferred-demo (demoLoad)="loadDemoData()">
            <div class="card">
                <p-table [value]="products" [tableStyle]="{ 'min-width': '50rem' }">
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
                            <td><p-skeleton /></td>
                            <td><p-skeleton /></td>
                            <td><p-skeleton /></td>
                            <td><p-skeleton /></td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </app-p-deferred-demo>
        <app-code></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSkeletonDoc {
    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    loadDemoData() {
        this.products = Array.from({ length: 10 }).map((_, i) => ({ id: i.toString() }));
        this.cd.markForCheck();
    }
}
