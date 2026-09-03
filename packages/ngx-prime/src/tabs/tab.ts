import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, forwardRef, inject, InjectionToken, ViewEncapsulation } from '@angular/core';
import { Tab as AriaTab } from '@angular/aria/tabs';
import { SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import { Ripple } from '@wawjs/ngx-prime/ripple';
import { TabPassThrough } from '@wawjs/ngx-prime/types/tabs';
import { TabStyle } from './style/tabstyle';
import { TabList } from './tablist';
import { Tabs } from './tabs';

const TAB_INSTANCE = new InjectionToken<Tab>('TAB_INSTANCE');

/**
 * Defines valid properties in Tab component.
 * @group Components
 */
@Component({
    selector: 'p-tab',
    standalone: true,
    imports: [SharedModule, BindModule],
    template: ` <ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': 'cx("root")',
        '[attr.data-p-disabled]': 'disabled()',
        '[attr.data-p-active]': 'active()'
    },
    hostDirectives: [Ripple, Bind, { directive: AriaTab, inputs: ['value', 'disabled'] }],
    providers: [TabStyle, { provide: TAB_INSTANCE, useExisting: Tab }, { provide: PARENT_INSTANCE, useExisting: Tab }]
})
export class Tab extends BaseComponent<TabPassThrough> {
    componentName = 'Tab';

    $pcTab: Tab | undefined = inject(TAB_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * The `ngTab` instance applied to this component's host, forwarding `value`/`disabled`
     * via `hostDirectives`.
     */
    ariaTab = inject(AriaTab, { self: true });

    pcTabs = inject(forwardRef(() => Tabs));

    pcTabList = inject(forwardRef(() => TabList));

    el = inject(ElementRef);

    _componentStyle = inject(TabStyle);

    ripple = computed(() => this.config.ripple());

    value = computed(() => this.ariaTab.value());

    disabled = computed(() => this.ariaTab.disabled());

    active = computed(() => this.ariaTab.selected());

    mutationObserver: MutationObserver | undefined;

    onAfterViewInit(): void {
        this.bindMutationObserver();
    }

    bindMutationObserver() {
        if (isPlatformBrowser(this.platformId)) {
            this.mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(() => {
                    if (this.active()) {
                        this.pcTabList?.updateInkBar();
                    }
                });
            });
            this.mutationObserver.observe(this.el.nativeElement, { childList: true, characterData: true, subtree: true });
        }
    }

    unbindMutationObserver() {
        this.mutationObserver?.disconnect();
    }

    onDestroy() {
        if (this.mutationObserver) {
            this.unbindMutationObserver();
        }
    }
}
