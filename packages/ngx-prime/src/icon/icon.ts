import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * A PrimeIcons icon paired with an optional label — either as a router link
 * or a clickable action, with a router-active underline indicator. Fills
 * the gap left by no ngx-prime component wrapping "icon + label + nav
 * behavior" into one tag (unlike e.g. `p-button`).
 *
 * @group Components
 */
@Component({
    selector: 'p-icon',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    template: `
        @if (hasRouterLink()) {
            <a routerLinkActive="p-icon-active" [class.p-icon-icon-only]="!name()" [attr.aria-label]="!name() ? ariaLabel() || icon() : null" [routerLink]="routerLink()" class="p-icon">
                <span class="p-icon-wrap">
                    <i class="pi pi-{{ icon() }} p-icon-glyph" aria-hidden="true"></i>
                </span>

                @if (name()) {
                    <span class="p-icon-name">{{ name() }}</span>
                }
            </a>
        } @else {
            <span [class.p-icon-icon-only]="!name()" class="p-icon" role="button" tabindex="0" [attr.aria-label]="!name() ? ariaLabel() || icon() : null" (click)="onAction()" (keydown)="onKeydown($event)">
                <span class="p-icon-wrap">
                    <i class="pi pi-{{ icon() }} p-icon-glyph" aria-hidden="true"></i>
                </span>

                @if (name()) {
                    <span class="p-icon-name">{{ name() }}</span>
                }
            </span>
        }
    `,
    styles: `
        .p-icon {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            white-space: nowrap;
            cursor: pointer;
            gap: var(--p-icon-gap, 0.5rem);
            padding: var(--p-icon-padding, 0.5rem 0.75rem);
            border-radius: var(--p-content-border-radius, 6px);
            text-decoration: none;
            color: var(--p-text-muted-color);
            transition: color 0.2s;
        }

        .p-icon:focus-visible {
            outline: none;
            box-shadow: var(--p-focus-ring-shadow, 0 0 0 2px var(--p-primary-color, #3b82f6));
        }

        .p-icon-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

        .p-icon-glyph {
            font-size: var(--p-icon-size, 1.375rem);
            line-height: 1;
        }

        .p-icon-name {
            font-size: 0.9rem;
            color: var(--p-text-color);
            line-height: 1;
        }

        .p-icon:hover,
        .p-icon:hover .p-icon-glyph,
        .p-icon:hover .p-icon-name {
            color: var(--p-primary-color);
        }

        .p-icon-active::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 0;
            width: 100%;
            height: 2px;
            background: var(--p-primary-color);
            border-radius: 999px;
            transform: translate(-50%);
        }

        .p-icon-icon-only {
            gap: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class Icon {
    /** PrimeIcons suffix, e.g. `'cog'` renders `pi pi-cog`. */
    icon = input.required<string>();
    /** Visible label; when empty, renders icon-only (uses `ariaLabel` for accessibility instead). */
    name = input('');
    /** Used when `name` is empty (icon-only). */
    ariaLabel = input('');
    /** If empty, renders as a clickable action and emits `action` instead of navigating. */
    routerLink = input('');

    action = output<void>();

    hasRouterLink = computed(() => this.routerLink().trim().length > 0);

    onAction(): void {
        this.action.emit();
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.onAction();
        }
    }
}

@NgModule({
    imports: [Icon],
    exports: [Icon]
})
export class IconModule {}
