import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation, computed, inject } from '@angular/core';
import { TEMPLATE_CONFIG } from '@wawjs/ngx-prime/config';

const CART_URL = 'https://prime.webart.work/cart';

/**
 * "Buy License" button — renders only when the app was configured with a
 * template slug via `provideTemplate({ slug })`. Links out to that
 * template's cart entry (`?template=<slug>`); nothing else about the
 * purchase (license tier, pricing) is known or passed yet.
 *
 * @group Components
 */
@Component({
    selector: 'p-buy-license',
    standalone: true,
    template: `
        @if (href(); as url) {
            <a [href]="url" target="_blank" rel="noopener" class="p-buy-license" aria-label="Buy License (opens in a new tab)">
                <i class="pi pi-shopping-cart p-buy-license-icon" aria-hidden="true"></i>
                <span class="p-buy-license-label">Buy License</span>
            </a>
        }
    `,
    styles: `
        .p-buy-license {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 1px solid var(--p-primary-color, #3b82f6);
            border-radius: var(--p-content-border-radius, 6px);
            background: var(--p-primary-color, #3b82f6);
            color: var(--p-primary-contrast-color, #ffffff);
            font-size: 0.9rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition:
                background 0.2s,
                border-color 0.2s;
        }

        .p-buy-license:hover {
            background: var(--p-primary-hover-color, var(--p-primary-color, #3b82f6));
            border-color: var(--p-primary-hover-color, var(--p-primary-color, #3b82f6));
        }

        .p-buy-license:focus-visible {
            outline: none;
            box-shadow: var(--p-focus-ring-shadow, 0 0 0 2px var(--p-primary-color, #3b82f6));
        }

        .p-buy-license-icon {
            font-size: 1rem;
            line-height: 1;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BuyLicense {
    private readonly config = inject(TEMPLATE_CONFIG, { optional: true });

    protected readonly href = computed(() => {
        const slug = this.config?.slug?.trim();
        return slug ? `${CART_URL}?template=${encodeURIComponent(slug)}` : null;
    });
}

@NgModule({
    imports: [BuyLicense],
    exports: [BuyLicense]
})
export class BuyLicenseModule {}
