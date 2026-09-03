import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ContentChild, effect, forwardRef, inject, InjectionToken, input, InputSignalWithTransform, model, NgModule, output, signal, TemplateRef, ViewEncapsulation } from '@angular/core';
import { AccordionGroup as AriaAccordionGroup, AccordionPanel as AriaAccordionPanel, AccordionTrigger as AriaAccordionTrigger } from '@angular/aria/accordion';
import { MotionOptions } from '@wawjs/css-prime-motion';
import { uuid } from '@wawjs/css-prime-utils';
import { BlockableUI, SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import { ChevronDownIcon, ChevronUpIcon } from '@wawjs/ngx-prime/icons';
import { MotionModule } from '@wawjs/ngx-prime/motion';
import { Ripple } from '@wawjs/ngx-prime/ripple';
import { AccordionContentPassThrough, AccordionHeaderPassThrough, AccordionPanelPassThrough, AccordionPassThrough } from '@wawjs/ngx-prime/types/accordion';
import { transformToBoolean } from '@wawjs/ngx-prime/utils';
import { AccordionStyle } from './style/accordionstyle';

/**
 * Custom tab open event.
 * @see {@link onOpen}
 * @group Interface
 */
export interface AccordionTabOpenEvent {
    /**
     * Browser event, when available. `@angular/aria` handles click/keyboard interaction
     * centrally on the accordion group, so the originating event isn't always accessible here.
     */
    originalEvent?: Event;
    /**
     * Opened tab index.
     */
    index: number;
}

/**
 * Custom tab close event.
 * @see {@link onClose}
 * @extends {AccordionTabOpenEvent}
 * @group Interface
 */
export type AccordionTabCloseEvent = AccordionTabOpenEvent;

/**
 * Toggle icon template context.
 * @group Interface
 */
export interface AccordionToggleIconTemplateContext {
    /**
     * Represents the active status of the panel.
     */
    active: boolean;
}
const ACCORDION_PANEL_INSTANCE = new InjectionToken<AccordionPanel>('ACCORDION_PANEL_INSTANCE');
const ACCORDION_HEADER_INSTANCE = new InjectionToken<AccordionHeader>('ACCORDION_HEADER_INSTANCE');
const ACCORDION_CONTENT_INSTANCE = new InjectionToken<AccordionContent>('ACCORDION_CONTENT_INSTANCE');
const ACCORDION_INSTANCE = new InjectionToken<Accordion>('ACCORDION_INSTANCE');

/**
 * AccordionPanel is a helper component for Accordion component.
 * @group Components
 */
@Component({
    selector: 'p-accordion-panel, p-accordionpanel',
    imports: [BindModule],
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': 'cx("panel")',
        '[attr.data-p-disabled]': 'disabled()',
        '[attr.data-p-active]': 'active()'
    },
    hostDirectives: [Bind],
    providers: [AccordionStyle, { provide: ACCORDION_PANEL_INSTANCE, useExisting: AccordionPanel }, { provide: PARENT_INSTANCE, useExisting: AccordionPanel }]
})
export class AccordionPanel extends BaseComponent<AccordionPanelPassThrough> {
    $pcAccordionPanel: AccordionPanel | undefined = inject(ACCORDION_PANEL_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    componentName = 'AccordionPanel';

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    pcAccordion = inject(forwardRef(() => Accordion));
    /**
     * Value of the active tab.
     * @defaultValue undefined
     * @group Props
     */
    value = model<undefined | null | string | number | string[] | number[]>(undefined);
    /**
     * Disables the tab when enabled.
     * @defaultValue false
     * @group Props
     */
    disabled: InputSignalWithTransform<any, boolean> = input(false, { transform: (v: any) => transformToBoolean(v) });

    active = computed(() => (this.pcAccordion.multiple() ? this.valueEquals(this.pcAccordion.value(), this.value()) : this.pcAccordion.value() === this.value()));

    valueEquals(currentValue: any, value: any): boolean {
        if (Array.isArray(currentValue)) {
            return currentValue.includes(value);
        }

        return currentValue === value;
    }

    _componentStyle = inject(AccordionStyle);
}
/**
 * AccordionHeader is a helper component for Accordion component.
 * @group Components
 */
@Component({
    selector: 'p-accordion-header, p-accordionheader',
    imports: [ChevronDownIcon, ChevronUpIcon, BindModule, NgTemplateOutlet],
    standalone: true,
    template: `
        <ng-content />
        @if (toggleicon) {
            <ng-template *ngTemplateOutlet="toggleicon; context: { active: active() }"></ng-template>
        } @else {
            @if (active()) {
                @if (pcAccordion.collapseIcon()) {
                    <span [class]="cn(cx('toggleicon'), pcAccordion.collapseIcon())" [attr.aria-hidden]="true" [pBind]="ptm('toggleicon')"></span>
                }
                @if (!pcAccordion.collapseIcon()) {
                    <svg data-p-icon="chevron-up" [class]="cx('toggleicon')" [pBind]="ptm('toggleicon')" [attr.aria-hidden]="true" />
                }
            }
            @if (!active()) {
                @if (pcAccordion.expandIcon()) {
                    <span [class]="cn(cx('toggleicon'), pcAccordion.expandIcon())" [attr.aria-hidden]="true" [pBind]="ptm('toggleicon')"></span>
                }
                @if (!pcAccordion.expandIcon()) {
                    <svg data-p-icon="chevron-down" [attr.aria-hidden]="true" [pBind]="ptm('toggleicon')" />
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cx('header')",
        '[attr.data-p-active]': 'active()',
        '[attr.data-p-disabled]': 'disabled()',
        '[style.user-select]': '"none"',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Ripple, Bind, { directive: AriaAccordionTrigger, inputs: ['panel', 'disabled'] }],
    providers: [AccordionStyle, { provide: ACCORDION_HEADER_INSTANCE, useExisting: AccordionHeader }, { provide: PARENT_INSTANCE, useExisting: AccordionHeader }]
})
export class AccordionHeader extends BaseComponent<AccordionHeaderPassThrough> {
    $pcAccordionHeader: AccordionHeader | undefined = inject(ACCORDION_HEADER_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    componentName = 'AccordionHeader';

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    pcAccordion = inject(forwardRef(() => Accordion));

    pcAccordionPanel = inject(forwardRef(() => AccordionPanel));

    ariaTrigger = inject(AriaAccordionTrigger, { self: true });

    /**
     * The `AccordionContent`'s `ngAccordionPanel` instance this header controls, forwarded to
     * `AriaAccordionTrigger`'s required `panel` input via `hostDirectives`.
     * @example
     * ```html
     * <p-accordion-header [panel]="content">Header</p-accordion-header>
     * <p-accordion-content #content>Content</p-accordion-content>
     * ```
     * @group Props
     */

    active = computed(() => this.pcAccordionPanel.active());

    disabled = computed(() => this.pcAccordionPanel.disabled());

    /** Keeps the accordion's `value` model in sync when the trigger toggles via click/keyboard. */
    private syncExpandedEffect = effect(() => {
        const expanded = this.ariaTrigger.expanded();

        if (expanded !== this.active()) {
            this.changeActiveValue();
        }
    });

    /** Reflects `Accordion`'s `value` model back onto the aria trigger's `expanded` state. */
    private syncActiveEffect = effect(() => {
        this.ariaTrigger.expanded.set(this.active());
    });

    /**
     * Toggle icon template.
     * @type {TemplateRef<AccordionToggleIconTemplateContext>} context - Context of the template
     * @example
     * ```html
     * <ng-template #toggleicon let-active="active"> </ng-template>
     * ```
     * @see {@link AccordionToggleIconTemplateContext}
     * @group Templates
     */
    @ContentChild('toggleicon') toggleicon: TemplateRef<AccordionToggleIconTemplateContext> | undefined;

    _componentStyle = inject(AccordionStyle);

    /** Invoked from `syncExpandedEffect` when the aria trigger's `expanded` state flips. */
    changeActiveValue() {
        const wasActive = this.active();
        const index = this.pcAccordionPanel.value();

        this.pcAccordion.updateValue(index);

        const isActive = this.active();

        if (!wasActive && isActive) {
            this.pcAccordion.onOpen.emit({ index });
        } else if (wasActive && !isActive) {
            this.pcAccordion.onClose.emit({ index });
        }
    }

    get dataP() {
        return this.cn({
            active: this.active()
        });
    }
}

@Component({
    selector: 'p-accordion-content, p-accordioncontent',
    imports: [BindModule, MotionModule],
    standalone: true,
    template: `
        <p-motion [visible]="active()" name="p-collapsible" hideStrategy="visibility" [mountOnEnter]="false" [unmountOnLeave]="false" [options]="computedMotionOptions()">
            <div [pBind]="ptm('contentWrapper', ptParams())" [class]="cx('contentWrapper')">
                <div [pBind]="ptm('content', ptParams())" [class]="cx('content')">
                    <ng-content />
                </div>
            </div>
        </p-motion>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': 'cx("contentContainer")',
        '[attr.data-p-active]': 'active()'
    },
    hostDirectives: [Bind, AriaAccordionPanel],
    providers: [AccordionStyle, { provide: ACCORDION_CONTENT_INSTANCE, useExisting: AccordionContent }, { provide: PARENT_INSTANCE, useExisting: AccordionContent }]
})
export class AccordionContent extends BaseComponent<AccordionContentPassThrough> {
    $pcAccordionContent: AccordionContent | undefined = inject(ACCORDION_CONTENT_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    componentName = 'AccordionContent';

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    pcAccordion = inject(forwardRef(() => Accordion));

    pcAccordionPanel = inject(forwardRef(() => AccordionPanel));

    /** The `ngAccordionPanel` instance applied to this component's host, exported as `#content="ngAccordionPanel"`. */
    ariaPanel = inject(AriaAccordionPanel, { self: true });

    active = computed(() => this.pcAccordionPanel.active());

    _componentStyle = inject(AccordionStyle);

    ptParams = computed(() => ({ context: this.active() }));

    computedMotionOptions = computed<MotionOptions>(() => ({
        ...this.ptm('motion', this.ptParams()),
        ...this.pcAccordion.computedMotionOptions()
    }));
}

/**
 * Accordion groups a collection of contents in tabs.
 * @group Components
 */
@Component({
    selector: 'p-accordion',
    standalone: true,
    imports: [SharedModule, BindModule],
    template: ` <ng-content />`,
    host: {
        '[class]': "cn(cx('root'), styleClass())"
    },
    hostDirectives: [Bind, { directive: AriaAccordionGroup, inputs: ['multiExpandable: multiple'] }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [AccordionStyle, { provide: ACCORDION_INSTANCE, useExisting: Accordion }, { provide: PARENT_INSTANCE, useExisting: Accordion }]
})
export class Accordion extends BaseComponent<AccordionPassThrough> implements BlockableUI {
    componentName = 'Accordion';

    $pcAccordion: Accordion | undefined = inject(ACCORDION_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    /** The `ngAccordionGroup` instance applied to this component's host. */
    ariaGroup = inject(AriaAccordionGroup, { self: true });

    /**
     * Value of the active tab.
     * @defaultValue undefined
     * @group Props
     */
    value = model<undefined | null | string | number | string[] | number[]>(undefined);
    /**
     * When enabled, multiple tabs can be activated at the same time.
     * @defaultValue false
     * @group Props
     */
    multiple = this.ariaGroup.multiExpandable;
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Icon of a collapsed tab.
     * @group Props
     */
    expandIcon = input<string>();
    /**
     * Icon of an expanded tab.
     * @group Props
     */
    collapseIcon = input<string>();
    /**
     * Transition options of the animation.
     * @group Props
     * @deprecated since v21.0.0, use `motionOptions` instead.
     */
    transitionOptions = input('400ms cubic-bezier(0.86, 0, 0.07, 1)');

    /**
     * The motion options.
     * @group Props
     */
    motionOptions = input<MotionOptions | undefined>(undefined);

    computedMotionOptions = computed<MotionOptions>(() => ({
        ...this.ptm('motion'),
        ...this.motionOptions()
    }));

    /**
     * Callback to invoke when an active tab is collapsed by clicking on the header.
     * @param {AccordionTabCloseEvent} event - Custom tab close event.
     * @group Emits
     */
    onClose = output<AccordionTabCloseEvent>();
    /**
     * Callback to invoke when a tab gets expanded.
     * @param {AccordionTabOpenEvent} event - Custom tab open event.
     * @group Emits
     */
    onOpen = output<AccordionTabOpenEvent>();

    id = signal(uuid('pn_id_'));

    _componentStyle = inject(AccordionStyle);

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    updateValue(value: string | number) {
        const currentValue = this.value();

        if (this.multiple()) {
            const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
            const index = newValue.indexOf(value);

            if (index !== -1) {
                newValue.splice(index, 1);
            } else {
                newValue.push(value);
            }

            this.value.set(newValue as typeof this.value extends (...args: any) => infer R ? R : never);
        } else {
            if (currentValue === value) {
                this.value.set(undefined);
            } else {
                this.value.set(value);
            }
        }
    }
}

@NgModule({
    imports: [Accordion, SharedModule, AccordionPanel, AccordionHeader, AccordionContent, BindModule],
    exports: [Accordion, SharedModule, AccordionPanel, AccordionHeader, AccordionContent, BindModule]
})
export class AccordionModule {}
