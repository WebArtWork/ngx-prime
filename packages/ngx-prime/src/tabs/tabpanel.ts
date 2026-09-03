import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChild, forwardRef, inject, InjectionToken, input, ViewEncapsulation } from '@angular/core';
import { TabPanel as AriaTabPanel } from '@angular/aria/tabs';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import { TabPanelStyle } from './style/tabpanelstyle';
import { Tabs } from './tabs';
import { TabPanelPassThrough } from '@wawjs/ngx-prime/types/tabs';

const TABPANEL_INSTANCE = new InjectionToken<TabPanel>('TABPANEL_INSTANCE');

/**
 * TabPanel is a helper component for Tabs component.
 * @group Components
 */
@Component({
    selector: 'p-tabpanel',
    standalone: true,
    imports: [NgTemplateOutlet, BindModule],
    template: `
        <ng-template #defaultContent>
            <ng-content />
        </ng-template>

        @if (shouldRender()) {
            <ng-container *ngTemplateOutlet="content() ? content() : defaultContent" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [TabPanelStyle, { provide: TABPANEL_INSTANCE, useExisting: TabPanel }, { provide: PARENT_INSTANCE, useExisting: TabPanel }],
    host: {
        '[class]': 'cx("root")',
        '[attr.data-p-active]': 'active()',
        '[hidden]': '!active()'
    },
    hostDirectives: [Bind, { directive: AriaTabPanel, inputs: ['value'] }]
})
export class TabPanel extends BaseComponent<TabPanelPassThrough> {
    componentName = 'TabPanel';

    $pcTabPanel: TabPanel | undefined = inject(TABPANEL_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    pcTabs = inject<Tabs>(forwardRef(() => Tabs));

    /** The `ngTabPanel` instance applied to this component's host, forwarding `value`. */
    ariaTabPanel = inject(AriaTabPanel, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * When enabled, tab is not rendered until activation.
     * @type boolean
     * @defaultValue false
     * @group Props
     */
    lazy = input(false, { transform: booleanAttribute });
    /**
     * Template for initializing complex content when lazy is enabled.
     * @group Templates
     */
    content = contentChild('content', { descendants: false });

    value = computed(() => this.ariaTabPanel.value());

    active = computed(() => this.ariaTabPanel.visible());

    isLazyEnabled = computed(() => this.pcTabs.lazy() || this.lazy());

    private hasBeenRendered = false;

    shouldRender = computed(() => {
        if (!this.isLazyEnabled() || this.hasBeenRendered) {
            return true;
        }

        if (this.active()) {
            this.hasBeenRendered = true;

            return true;
        }

        return false;
    });

    _componentStyle = inject(TabPanelStyle);
}
