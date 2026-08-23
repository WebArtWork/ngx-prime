import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    ElementRef,
    inject,
    InjectionToken,
    input,
    model,
    NgModule,
    output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    contentChild,
    contentChildren
} from '@angular/core';
import { MotionEvent, MotionOptions } from '@wawjs/css-prime-motion';
import { uuid } from '@wawjs/css-prime-utils';
import { BlockableUI, Footer, PrimeTemplate, SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { MinusIcon, PlusIcon } from '@wawjs/ngx-prime/icons';
import { MotionModule } from '@wawjs/ngx-prime/motion';
import type { PanelAfterToggleEvent, PanelBeforeToggleEvent, PanelHeaderIconsTemplateContext, PanelPassThrough } from '@wawjs/ngx-prime/types/panel';
import { PanelStyle } from './style/panelstyle';

const PANEL_INSTANCE = new InjectionToken<Panel>('PANEL_INSTANCE');

/**
 * Panel is a container with the optional content toggle feature.
 * @group Components
 */
@Component({
    selector: 'p-panel',
    standalone: true,
    imports: [CommonModule, PlusIcon, MinusIcon, ButtonModule, SharedModule, BindModule, MotionModule],
    template: `
        @if (showHeader()) {
            <div [pBind]="ptm('header')" [class]="cx('header')" (click)="onHeaderClick($event)" [attr.id]="id() + '-titlebar'" [attr.data-p]="dataP">
                @if (_header()) {
                    <span [pBind]="ptm('title')" [class]="cx('title')" [attr.id]="id() + '_header'">{{ _header() }}</span>
                }
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate() || _headerTemplate"></ng-container>
                <div [pBind]="ptm('headerActions')" [class]="cx('headerActions')">
                    <ng-template *ngTemplateOutlet="iconsTemplate() || _iconsTemplate"></ng-template>
                    @if (toggleable()) {
                        <p-button
                            [attr.id]="id() + '_header'"
                            severity="secondary"
                            [text]="true"
                            [rounded]="true"
                            type="button"
                            role="button"
                            [styleClass]="cx('pcToggleButton')"
                            [attr.aria-label]="buttonAriaLabel"
                            [attr.aria-controls]="id() + '_content'"
                            [attr.aria-expanded]="!collapsed()"
                            (click)="onIconClick($event)"
                            (keydown)="onKeyDown($event)"
                            [buttonProps]="toggleButtonProps()"
                            [pt]="ptm('pcToggleButton')"
                            [unstyled]="unstyled()"
                        >
                            <ng-template #icon>
                                @if (!headerIconsTemplate() && !_headerIconsTemplate && !toggleButtonProps()?.icon) {
                                    @if (!collapsed()) {
                                        <svg data-p-icon="minus" [pBind]="ptm('pcToggleButton.icon')" />
                                    }
                                    @if (collapsed()) {
                                        <svg data-p-icon="plus" [pBind]="ptm('pcToggleButton.icon')" />
                                    }
                                }
                                <ng-template *ngTemplateOutlet="headerIconsTemplate() || _headerIconsTemplate; context: { $implicit: collapsed() }"></ng-template>
                            </ng-template>
                        </p-button>
                    }
                </div>
            </div>
        }
        <div
            [pBind]="ptm('contentContainer')"
            [pMotion]="!toggleable() || (toggleable() && !collapsed())"
            pMotionName="p-collapsible"
            [pMotionOptions]="computedMotionOptions()"
            [class]="cx('contentContainer')"
            [id]="id() + '_content'"
            role="region"
            [attr.aria-labelledby]="id() + '_header'"
            [attr.aria-hidden]="collapsed()"
            [attr.tabindex]="collapsed() ? '-1' : undefined"
            (pMotionOnAfterEnter)="onToggleDone($event)"
        >
            <div [pBind]="ptm('contentWrapper')" [class]="cx('contentWrapper')">
                <div [pBind]="ptm('content')" [class]="cx('content')" #contentWrapper>
                    <ng-content></ng-content>
                    <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate"></ng-container>
                </div>

                @if (footerFacet() || footerTemplate || _footerTemplate) {
                    <div [pBind]="ptm('footer')" [class]="cx('footer')">
                        <ng-content select="p-footer"></ng-content>
                        <ng-container *ngTemplateOutlet="footerTemplate || _footerTemplate"></ng-container>
                    </div>
                }
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [PanelStyle, { provide: PANEL_INSTANCE, useExisting: Panel }, { provide: PARENT_INSTANCE, useExisting: Panel }],
    host: {
        '[id]': 'id()',
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Panel extends BaseComponent<PanelPassThrough> implements BlockableUI {
    componentName = 'Panel';

    $pcPanel: Panel | undefined = inject(PANEL_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    _componentStyle = inject(PanelStyle);

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Id of the component.
     */
    id = input<string | undefined>(uuid('pn_id_'));
    /**
     * Defines if content of panel can be expanded and collapsed.
     * @group Props
     */
    toggleable = input<boolean, unknown>(undefined, { transform: booleanAttribute });

    /**
     * Header text of the panel.
     * @group Props
     */
    // eslint-disable-next-line @angular-eslint/no-input-rename -- `header` is published public API; renaming would break consumers.
    _header = input<string | undefined>(undefined, { alias: 'header' });

    /**
     * Defines the initial state of panel content, supports one or two-way binding as well.
     * @group Props
     */
    collapsed = model<boolean | undefined>(undefined);

    /**
     * Style class of the component.
     * @group Props
     * @deprecated since v20.0.0, use `class` instead.
     */
    styleClass = input<string>();

    /**
     * Position of the icons.
     * @group Props
     */
    iconPos = input<'start' | 'end' | 'center'>('end');

    /**
     * Specifies if header of panel cannot be displayed.
     * @group Props
     */
    showHeader = input(true, { transform: booleanAttribute });

    /**
     * Specifies the toggler element to toggle the panel content.
     * @group Props
     */
    toggler = input<'icon' | 'header'>('icon');

    /**
     * Transition options of the animation.
     * @group Props
     * @deprecated since v21.0.0, use `motionOptions` instead.
     */
    transitionOptions = input('400ms cubic-bezier(0.86, 0, 0.07, 1)');

    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    toggleButtonProps = input<any>();

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
     * Callback to invoke before panel toggle.
     * @param {PanelBeforeToggleEvent} event - Custom panel toggle event
     * @group Emits
     */
    onBeforeToggle = output<PanelBeforeToggleEvent>();

    /**
     * Callback to invoke after panel toggle.
     * @param {PanelAfterToggleEvent} event - Custom panel toggle event
     * @group Emits
     */
    onAfterToggle = output<PanelAfterToggleEvent>();

    readonly footerFacet = contentChild(Footer);
    /**
     * Defines template option for header.
     * @group Templates
     */
    readonly headerTemplate = contentChild<TemplateRef<void>>('header', { descendants: false });
    /**
     * Defines template option for icons.
     * @example
     * ```html
     * <ng-template #icons> </ng-template>
     * ```
     * @group Templates
     */
    readonly iconsTemplate = contentChild<TemplateRef<void>>('icons', { descendants: false });

    /**
     * Defines template option for content.
     * @example
     * ```html
     * <ng-template #content> </ng-template>
     * ```
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<void>>('content', { descendants: false });

    /**
     * Defines template option for footer.
     * @example
     * ```html
     * <ng-template #footer> </ng-template>
     * ```
     * @group Templates
     */
    @ContentChild('footer', { descendants: false }) footerTemplate: TemplateRef<void> | undefined;

    /**
     * Defines template option for headerIcon.
     * @param {PanelHeaderIconsTemplateContext} context - context of the template.
     * @example
     * ```html
     * <ng-template #headericons let-collapsed> </ng-template>
     * ```
     * @see {@link PanelHeaderIconsTemplateContext}
     * @group Templates
     */
    readonly headerIconsTemplate = contentChild<TemplateRef<PanelHeaderIconsTemplateContext>>('headericons', { descendants: false });

    _headerTemplate: TemplateRef<void> | undefined;

    _iconsTemplate: TemplateRef<void> | undefined;

    _contentTemplate: TemplateRef<void> | undefined;

    _footerTemplate: TemplateRef<void> | undefined;

    _headerIconsTemplate: TemplateRef<PanelHeaderIconsTemplateContext> | undefined;

    @ViewChild('contentWrapper') contentWrapperViewChild: ElementRef;

    get buttonAriaLabel() {
        return this._header();
    }

    onHeaderClick(event: MouseEvent) {
        if (this.toggler() === 'header') {
            this.toggle(event);
        }
    }

    onIconClick(event: MouseEvent) {
        if (this.toggler() === 'icon') {
            this.toggle(event);
        }
    }

    toggle(event: MouseEvent) {
        this.onBeforeToggle.emit({ originalEvent: event, collapsed: this.collapsed() });

        if (this.collapsed()) this.expand();
        else this.collapse();

        event.preventDefault();
    }

    expand() {
        this.collapsed.set(false);
        this.updateTabIndex();
    }

    collapse() {
        this.collapsed.set(true);
        this.updateTabIndex();
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement;
    }

    updateTabIndex() {
        if (this.contentWrapperViewChild) {
            const focusableElements = this.contentWrapperViewChild.nativeElement.querySelectorAll('input, button, select, a, textarea, [tabindex]');

            focusableElements.forEach((element: HTMLElement) => {
                if (this.collapsed()) {
                    element.setAttribute('tabindex', '-1');
                } else {
                    element.removeAttribute('tabindex');
                }
            });
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Enter' || event.code === 'Space') {
            this.toggle(event as any);
            event.preventDefault();
        }
    }

    onToggleDone(event: MotionEvent) {
        this.onAfterToggle.emit({ originalEvent: event as any, collapsed: this.collapsed() });
    }

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'footer':
                    this._footerTemplate = item.template;
                    break;

                case 'icons':
                    this._iconsTemplate = item.template;
                    break;

                case 'headericons':
                    this._headerIconsTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    get dataP() {
        return this.cn({
            toggleable: this.toggleable()
        });
    }
}

@NgModule({
    imports: [Panel, SharedModule, BindModule],
    exports: [Panel, SharedModule, BindModule]
})
export class PanelModule {}
