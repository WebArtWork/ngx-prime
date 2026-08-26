import { Directive, ElementRef, InjectionToken, Renderer2, computed, effect, inject, input } from '@angular/core';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import type { LinkIconPosition, LinkPassThrough } from '@wawjs/ngx-prime/types/link';
import { LinkStyle } from './style/linkstyle';

const LINK_INSTANCE = new InjectionToken<Link>('LINK_INSTANCE');

export type LinkType = 'email' | 'tel' | 'sms' | 'whatsapp' | 'url' | 'custom';

/**
 * Link renders a semantic, styled anchor for display-only navigation. It
 * derives `mailto:`, `tel:`, `sms:`, WhatsApp, or `https:` targets from
 * `value` based on `type`, or use `href` directly for a custom target.
 *
 * [Live Demo](https://ngx-prime.org/link)
 *
 * @group Components
 */
@Directive({
    selector: 'a[pLink]',
    standalone: true,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.href]': 'hostHref',
        '[attr.target]': 'target()',
        '[attr.rel]': 'hostRel',
        '[attr.aria-disabled]': 'hostAriaDisabled',
        '[attr.data-p]': 'dataP',
        '(click)': 'onClick($event)'
    },
    providers: [LinkStyle, { provide: LINK_INSTANCE, useExisting: Link }, { provide: PARENT_INSTANCE, useExisting: Link }],
    hostDirectives: [Bind]
})
export class Link extends BaseComponent<LinkPassThrough> {
    componentName = 'Link';

    $pcLink: Link | undefined = inject(LINK_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    _componentStyle = inject(LinkStyle);

    private readonly _renderer = inject(Renderer2);

    /**
     * Style class of the component.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Text or address the href is derived from when `href` is not set.
     * @group Props
     */
    value = input<string>('');
    /**
     * Determines how `value` is turned into an href.
     * @group Props
     */
    type = input<LinkType>('url');
    /**
     * Explicit href, takes precedence over the value derived from `value`/`type`.
     * @group Props
     */
    href = input<string | null>(null);
    /**
     * Native anchor target.
     * @group Props
     */
    target = input<string>('_self');
    /**
     * Explicit rel, defaults to `noopener noreferrer` for `_blank` targets.
     * @group Props
     */
    rel = input<string | null>(null);
    /**
     * Icon shown next to the anchor content, e.g. `pi pi-envelope`.
     * @group Props
     */
    icon = input<string>();
    /**
     * Position of the icon relative to the anchor content.
     * @group Props
     */
    iconPos = input<LinkIconPosition>('left');
    /**
     * When true, the link is not navigable and click events are suppressed.
     * @group Props
     */
    disabled = input<boolean>(false);

    linkHref = computed(() => {
        const explicitHref = this.href()?.trim();

        if (explicitHref) {
            return explicitHref;
        }

        const value = this.value().trim();

        if (!value) {
            return null;
        }

        switch (this.type()) {
            case 'email':
                return `mailto:${value}`;
            case 'tel':
                return `tel:${value.replace(/[^+\d]/g, '')}`;
            case 'sms':
                return `sms:${value.replace(/[^+\d]/g, '')}`;
            case 'whatsapp':
                return `https://wa.me/${value.replace(/\D/g, '')}`;
            case 'url':
                return /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
            case 'custom':
                return null;
            default:
                return null;
        }
    });

    linkRel = computed(() => {
        const rel = this.rel()?.trim();

        if (rel) {
            return rel;
        }

        return this.target() === '_blank' ? 'noopener noreferrer' : null;
    });

    isClickable = computed(() => !!this.linkHref() && !this.disabled());

    get hostHref(): string | null {
        return this.isClickable() ? this.linkHref() : null;
    }

    get hostRel(): string | null {
        return this.linkRel();
    }

    get hostAriaDisabled(): 'true' | null {
        return this.disabled() || !this.linkHref() ? 'true' : null;
    }

    get dataP() {
        return this.cn({
            disabled: this.disabled()
        });
    }

    private readonly _elementRef = inject<ElementRef<HTMLAnchorElement>>(ElementRef);
    private readonly _iconEl: HTMLElement;

    constructor() {
        super();

        this._iconEl = this._renderer.createElement('span');
        this._renderer.setAttribute(this._iconEl, 'aria-hidden', 'true');

        effect(() => this._syncIcon());
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    onClick(event: MouseEvent): void {
        if (!this.isClickable()) {
            event.preventDefault();
            return;
        }
    }

    private _syncIcon(): void {
        const iconClass = this.icon();
        const host = this._elementRef.nativeElement;

        this._iconEl.className = this.cn(this.cx('icon'), iconClass) ?? '';

        if (!iconClass) {
            if (this._iconEl.parentElement) {
                this._renderer.removeChild(host, this._iconEl);
            }
            return;
        }

        if (!this._iconEl.parentElement) {
            if (this.iconPos() === 'right') {
                this._renderer.appendChild(host, this._iconEl);
            } else {
                this._renderer.insertBefore(host, this._iconEl, host.firstChild);
            }
        }
    }
}
