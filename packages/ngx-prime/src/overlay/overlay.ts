import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, InjectionToken, input, model, NgModule, NgZone, output, signal, TemplateRef, ViewEncapsulation, viewChild, contentChild, contentChildren } from '@angular/core';
import { MotionEvent, MotionOptions } from '@wawjs/css-prime-motion';
import { absolutePosition, addClass, appendChild, focus, getOuterWidth, getTargetElement, isTouchDevice, relativePosition, removeClass } from '@wawjs/css-prime-utils';
import { OverlayModeType, OverlayOnBeforeHideEvent, OverlayOnBeforeShowEvent, OverlayOnHideEvent, OverlayOnShowEvent, OverlayOptions, OverlayService, PrimeTemplate, ResponsiveOverlayOptions, SharedModule } from 'primeng/api';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { ConnectedOverlayScrollHandler } from 'primeng/dom';
import { MotionModule } from 'primeng/motion';
import { Subscription } from 'rxjs';
import { VoidListener } from 'primeng/ts-helpers';
import { ObjectUtils, ZIndexUtils } from 'primeng/utils';
import { OverlayContentTemplateContext } from 'primeng/types/overlay';
import { OverlayStyle } from './style/overlaystyle';

const OVERLAY_INSTANCE = new InjectionToken<Overlay>('OVERLAY_INSTANCE');

/**
 * This API allows overlay components to be controlled from the PrimeNG. In this way, all overlay components in the application can have the same behavior.
 * @group Components
 */
@Component({
    selector: 'p-overlay',
    standalone: true,
    imports: [CommonModule, SharedModule, Bind, MotionModule],
    hostDirectives: [Bind],
    template: `
        @if (inline()) {
            <ng-content></ng-content>
            <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate; context: { $implicit: { mode: null } }"></ng-container>
        } @else {
            @if (modalVisible) {
                <div #overlay [class]="cn(cx('root'), styleClass)" [style]="sx('root')" [pBind]="ptm('root')" (click)="onOverlayClick()">
                    <p-motion
                        [visible]="visible()"
                        name="p-anchored-overlay"
                        [appear]="true"
                        [options]="computedMotionOptions()"
                        (onBeforeEnter)="onOverlayBeforeEnter($event)"
                        (onEnter)="onOverlayEnter($event)"
                        (onAfterEnter)="onOverlayAfterEnter($event)"
                        (onBeforeLeave)="onOverlayBeforeLeave($event)"
                        (onLeave)="onOverlayLeave($event)"
                        (onAfterLeave)="onOverlayAfterLeave($event)"
                    >
                        <div #content [class]="cn(cx('content'), contentStyleClass)" [pBind]="ptm('content')" (click)="onOverlayContentClick($event)">
                            <ng-content></ng-content>
                            <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate; context: { $implicit: { mode: overlayMode } }"></ng-container>
                        </div>
                    </p-motion>
                </div>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [OverlayStyle, { provide: OVERLAY_INSTANCE, useExisting: Overlay }, { provide: PARENT_INSTANCE, useExisting: Overlay }]
})
export class Overlay extends BaseComponent {
    overlayService = inject(OverlayService);
    private zone = inject(NgZone);

    componentName = 'Overlay';

    $pcOverlay: Overlay | undefined = inject(OVERLAY_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    hostName = input('');

    /**
     * The visible property is an input that determines the visibility of the component.
     * @defaultValue false
     * @group Props
     */
    visible = model(false);
    /**
     * The mode property is an input that determines the overlay mode type or string.
     * @defaultValue null
     * @group Props
     */
    // Keep the established public names while preserving their option-merging getters.
    /* eslint-disable @angular-eslint/no-input-rename */
    readonly _mode = input<OverlayModeType | string | undefined>(undefined, { alias: 'mode' });

    get mode(): OverlayModeType | string {
        return this._mode() || this.overlayOptions?.mode;
    }
    /**
     * The style property is an input that determines the style object for the component.
     * @defaultValue null
     * @group Props
     */
    readonly _style = input<{ [klass: string]: any } | null | undefined>(undefined, { alias: 'style' });

    get style(): { [klass: string]: any } | null | undefined {
        return ObjectUtils.merge(this._style(), this.modal ? this.overlayResponsiveOptions?.style : this.overlayOptions?.style);
    }
    /**
     * The styleClass property is an input that determines the CSS class(es) for the component.
     * @defaultValue null
     * @group Props
     */
    readonly _styleClass = input<string | undefined>(undefined, { alias: 'styleClass' });

    get styleClass(): string {
        return ObjectUtils.merge(this._styleClass(), this.modal ? this.overlayResponsiveOptions?.styleClass : this.overlayOptions?.styleClass);
    }
    /**
     * The contentStyle property is an input that determines the style object for the content of the component.
     * @defaultValue null
     * @group Props
     */
    readonly _contentStyle = input<{ [klass: string]: any } | null | undefined>(undefined, { alias: 'contentStyle' });

    get contentStyle(): { [klass: string]: any } | null | undefined {
        return ObjectUtils.merge(this._contentStyle(), this.modal ? this.overlayResponsiveOptions?.contentStyle : this.overlayOptions?.contentStyle);
    }
    /**
     * The contentStyleClass property is an input that determines the CSS class(es) for the content of the component.
     * @defaultValue null
     * @group Props
     */
    readonly _contentStyleClass = input<string | undefined>(undefined, { alias: 'contentStyleClass' });

    get contentStyleClass(): string {
        return ObjectUtils.merge(this._contentStyleClass(), this.modal ? this.overlayResponsiveOptions?.contentStyleClass : this.overlayOptions?.contentStyleClass);
    }
    /**
     * The target property is an input that specifies the target element or selector for the component.
     * @defaultValue null
     * @group Props
     */
    readonly _target = input<string | null | undefined>(undefined, { alias: 'target' });

    get target(): string | null | undefined {
        const value = this._target() || this.overlayOptions?.target;

        return value === undefined ? '@prev' : value;
    }
    /**
     * The autoZIndex determines whether to automatically manage layering. Its default value is 'false'.
     * @defaultValue false
     * @group Props
     */
    readonly _autoZIndex = input<boolean | undefined>(undefined, { alias: 'autoZIndex' });

    get autoZIndex(): boolean {
        const value = this._autoZIndex() || this.overlayOptions?.autoZIndex;

        return value === undefined ? true : value;
    }
    /**
     * The baseZIndex is base zIndex value to use in layering.
     * @defaultValue null
     * @group Props
     */
    readonly _baseZIndex = input<number | undefined>(undefined, { alias: 'baseZIndex' });

    get baseZIndex(): number {
        const value = this._baseZIndex() || this.overlayOptions?.baseZIndex;

        return value === undefined ? 0 : value;
    }
    /**
     * Transition options of the show or hide animation.
     * @defaultValue .12s cubic-bezier(0, 0, 0.2, 1)
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    readonly _showTransitionOptions = input<string | undefined>(undefined, { alias: 'showTransitionOptions' });

    get showTransitionOptions(): string {
        const value = this._showTransitionOptions() || this.overlayOptions?.showTransitionOptions;

        return value === undefined ? '.12s cubic-bezier(0, 0, 0.2, 1)' : value;
    }
    /**
     * The hideTransitionOptions property is an input that determines the CSS transition options for hiding the component.
     * @defaultValue .1s linear
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    readonly _hideTransitionOptions = input<string | undefined>(undefined, { alias: 'hideTransitionOptions' });

    get hideTransitionOptions(): string {
        const value = this._hideTransitionOptions() || this.overlayOptions?.hideTransitionOptions;

        return value === undefined ? '.1s linear' : value;
    }
    /**
     * The listener property is an input that specifies the listener object for the component.
     * @defaultValue null
     * @group Props
     */
    readonly _listener = input<any>(undefined, { alias: 'listener' });

    get listener(): any {
        return this._listener() || this.overlayOptions?.listener;
    }
    /**
     * It is the option used to determine in which mode it should appear according to the given media or breakpoint.
     * @defaultValue null
     * @group Props
     */
    readonly _responsive = input<ResponsiveOverlayOptions | undefined>(undefined, { alias: 'responsive' });

    get responsive(): ResponsiveOverlayOptions | undefined {
        return this._responsive() || this.overlayOptions?.responsive;
    }
    /**
     * The options property is an input that specifies the overlay options for the component.
     * @defaultValue null
     * @group Props
     */
    /* eslint-enable @angular-eslint/no-input-rename */
    options = input<OverlayOptions | undefined>(undefined);
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'self'
     * @group Props
     */
    appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>(undefined);
    /**
     * Specifies whether the overlay should be rendered inline within the current component's template.
     * @defaultValue false
     * @group Props
     */
    inline = input<boolean>(false);
    /**
     * The motion options.
     * @group Props
     */
    motionOptions = input<MotionOptions | undefined>(undefined);

    computedMotionOptions = computed<MotionOptions>(() => ({
        ...this.ptm('motion'),
        ...(this.motionOptions() || this.overlayOptions?.motionOptions)
    }));
    /**
     * This EventEmitter is used to notify changes in the visibility state of a component.
     * @param {Boolean} boolean - Value of visibility as boolean.
     * @group Emits
     */
    /**
     * Callback to invoke before the overlay is shown.
     * @param {OverlayOnBeforeShowEvent} event - Custom overlay before show event.
     * @group Emits
     */
    onBeforeShow = output<OverlayOnBeforeShowEvent>();
    /**
     * Callback to invoke when the overlay is shown.
     * @param {OverlayOnShowEvent} event - Custom overlay show event.
     * @group Emits
     */
    onShow = output<OverlayOnShowEvent>();
    /**
     * Callback to invoke before the overlay is hidden.
     * @param {OverlayOnBeforeHideEvent} event - Custom overlay before hide event.
     * @group Emits
     */
    onBeforeHide = output<OverlayOnBeforeHideEvent>();
    /**
     * Callback to invoke when the overlay is hidden
     * @param {OverlayOnHideEvent} event - Custom hide event.
     * @group Emits
     */
    onHide = output<OverlayOnHideEvent>();
    /**
     * Callback to invoke when the animation is started.
     * @param {AnimationEvent} event - Animation event.
     * @group Emits
     * @deprecated since v21.0.0. Use onOverlayBeforeEnter and onOverlayBeforeLeave instead.
     */
    onAnimationStart = output<AnimationEvent>();
    /**
     * Callback to invoke when the animation is done.
     * @param {AnimationEvent} event - Animation event.
     * @group Emits
     * @deprecated since v21.0.0. Use onOverlayAfterEnter and onOverlayAfterLeave instead.
     */
    onAnimationDone = output<AnimationEvent>();
    /**
     * Callback to invoke before the overlay enters.
     * @param {MotionEvent} event - Event before enter.
     * @group Emits
     */
    onBeforeEnter = output<MotionEvent>();
    /**
     * Callback to invoke when the overlay enters.
     * @param {MotionEvent} event - Event on enter.
     * @group Emits
     */
    onEnter = output<MotionEvent>();
    /**
     * Callback to invoke after the overlay has entered.
     * @param {MotionEvent} event - Event after enter.
     * @group Emits
     */
    onAfterEnter = output<MotionEvent>();
    /**
     * Callback to invoke before the overlay leaves.
     * @param {MotionEvent} event - Event before leave.
     * @group Emits
     */
    onBeforeLeave = output<MotionEvent>();
    /**
     * Callback to invoke when the overlay leaves.
     * @param {MotionEvent} event - Event on leave.
     * @group Emits
     */
    onLeave = output<MotionEvent>();
    /**
     * Callback to invoke after the overlay has left.
     * @param {MotionEvent} event - Event after leave.
     * @group Emits
     */
    onAfterLeave = output<MotionEvent>();

    readonly overlayViewChild = viewChild<ElementRef>('overlay');

    readonly contentViewChild = viewChild<ElementRef>('content');
    /**
     * Content template of the component.
     * @param {OverlayContentTemplateContext} context - content context.
     * @see {@link OverlayContentTemplateContext}
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<OverlayContentTemplateContext>>('content', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    hostAttrSelector = input<string>();

    $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    _contentTemplate: TemplateRef<OverlayContentTemplateContext> | undefined;

    modalVisible: boolean = false;

    isOverlayClicked: boolean = false;

    isOverlayContentClicked: boolean = false;

    scrollHandler: any;

    documentClickListener: any;

    documentResizeListener: any;

    _componentStyle = inject(OverlayStyle);

    bindDirectiveInstance = inject(Bind, { self: true });

    private documentKeyboardListener: VoidListener;

    private parentDragSubscription: Subscription | null = null;

    private window: Window | null;

    constructor() {
        super();

        effect(() => {
            if (this.visible() && !this.modalVisible) {
                this.modalVisible = true;
            }
        });
    }

    protected transformOptions: any = {
        default: 'scaleY(0.8)',
        center: 'scale(0.7)',
        top: 'translate3d(0px, -100%, 0px)',
        'top-start': 'translate3d(0px, -100%, 0px)',
        'top-end': 'translate3d(0px, -100%, 0px)',
        bottom: 'translate3d(0px, 100%, 0px)',
        'bottom-start': 'translate3d(0px, 100%, 0px)',
        'bottom-end': 'translate3d(0px, 100%, 0px)',
        left: 'translate3d(-100%, 0px, 0px)',
        'left-start': 'translate3d(-100%, 0px, 0px)',
        'left-end': 'translate3d(-100%, 0px, 0px)',
        right: 'translate3d(100%, 0px, 0px)',
        'right-start': 'translate3d(100%, 0px, 0px)',
        'right-end': 'translate3d(100%, 0px, 0px)'
    };

    get modal() {
        if (isPlatformBrowser(this.platformId)) {
            return this.mode === 'modal' || (this.overlayResponsiveOptions && this.document.defaultView?.matchMedia(this.overlayResponsiveOptions.media?.replace('@media', '') || `(max-width: ${this.overlayResponsiveOptions.breakpoint})`).matches);
        }
    }

    get overlayMode() {
        return this.mode || (this.modal ? 'modal' : 'overlay');
    }

    get overlayOptions(): OverlayOptions {
        return { ...this.config?.overlayOptions, ...this.options() }; // TODO: Improve performance
    }

    get overlayResponsiveOptions(): ResponsiveOverlayOptions {
        return { ...this.overlayOptions?.responsive, ...this.responsive }; // TODO: Improve performance
    }

    get overlayResponsiveDirection() {
        return this.overlayResponsiveOptions?.direction || 'center';
    }

    get overlayEl() {
        return this.overlayViewChild()?.nativeElement;
    }

    get contentEl() {
        return this.contentViewChild()?.nativeElement;
    }

    get targetEl() {
        return <any>getTargetElement(this.target, this.el?.nativeElement);
    }

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;
                // TODO: new template types may be added.
                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    show(overlay?: HTMLElement, isFocus: boolean = false) {
        this.onVisibleChange(true);
        this.handleEvents('onShow', { overlay: overlay || this.overlayEl, target: this.targetEl, mode: this.overlayMode });

        isFocus && focus(this.targetEl);
        this.modal && addClass(this.document?.body, 'p-overflow-hidden');
    }

    hide(overlay?: HTMLElement, isFocus: boolean = false) {
        if (!this.visible()) {
            return;
        } else {
            this.onVisibleChange(false);
            this.handleEvents('onHide', { overlay: overlay || this.overlayEl, target: this.targetEl, mode: this.overlayMode });
            isFocus && focus(this.targetEl as any);
            this.modal && removeClass(this.document?.body, 'p-overflow-hidden');
        }
    }

    onVisibleChange(visible: boolean) {
        this.visible.set(visible);
    }

    onOverlayClick() {
        this.isOverlayClicked = true;
    }

    onOverlayContentClick(event: MouseEvent) {
        this.overlayService.add({
            originalEvent: event,
            target: this.targetEl
        });

        this.isOverlayContentClicked = true;
    }

    container = signal<any>(undefined);

    onOverlayBeforeEnter(event: MotionEvent) {
        this.handleEvents('onBeforeShow', { overlay: this.overlayEl, target: this.targetEl, mode: this.overlayMode });
        this.container.set(this.overlayEl || event.element);
        this.show(this.overlayEl, true);
        this.hostAttrSelector() && this.overlayEl && this.overlayEl.setAttribute(this.hostAttrSelector(), '');
        this.appendOverlay();
        this.alignOverlay();
        this.bindParentDragListener();
        this.setZIndex();

        this.handleEvents('onBeforeEnter', event);
    }

    onOverlayEnter(event: MotionEvent) {
        this.handleEvents('onEnter', event);
    }

    onOverlayAfterEnter(event: MotionEvent) {
        this.bindListeners();
        this.handleEvents('onAfterEnter', event);
    }

    onOverlayBeforeLeave(event: MotionEvent) {
        this.handleEvents('onBeforeHide', { overlay: this.overlayEl, target: this.targetEl, mode: this.overlayMode });
        this.handleEvents('onBeforeLeave', event);
    }

    onOverlayLeave(event: MotionEvent) {
        this.handleEvents('onLeave', event);
    }

    onOverlayAfterLeave(event: MotionEvent) {
        this.hide(this.overlayEl, true);
        this.container.set(null);
        this.unbindListeners();
        this.appendOverlay();
        ZIndexUtils.clear(this.overlayEl);
        this.modalVisible = false;
        this.cd.markForCheck();
        this.handleEvents('onAfterLeave', event);
    }

    handleEvents(name: string, params: any) {
        (this as any)[name].emit(params);

        const options = this.options();

        options && (options as any)[name] && (options as any)[name](params);
        this.config?.overlayOptions && (this.config?.overlayOptions as any)[name] && (this.config?.overlayOptions as any)[name](params);
    }

    setZIndex() {
        if (this.autoZIndex) {
            ZIndexUtils.set(this.overlayMode, this.overlayEl, this.baseZIndex + this.config?.zIndex[this.overlayMode]);
        }
    }

    appendOverlay() {
        if (this.$appendTo() && this.$appendTo() !== 'self') {
            if (this.$appendTo() === 'body') {
                appendChild(this.document.body, this.overlayEl);
            } else {
                appendChild(this.$appendTo(), this.overlayEl);
            }
        }
    }

    alignOverlay() {
        if (!this.modal) {
            if (this.overlayEl && this.targetEl) {
                this.overlayEl.style.minWidth = getOuterWidth(this.targetEl) + 'px';

                if (this.$appendTo() === 'self') {
                    relativePosition(this.overlayEl, this.targetEl);
                } else {
                    absolutePosition(this.overlayEl, this.targetEl);
                }
            }
        }
    }

    bindListeners() {
        this.bindScrollListener();
        this.bindDocumentClickListener();
        this.bindDocumentResizeListener();
        this.bindDocumentKeyboardListener();
    }

    unbindListeners() {
        this.unbindScrollListener();
        this.unbindDocumentClickListener();
        this.unbindDocumentResizeListener();
        this.unbindDocumentKeyboardListener();
        this.unbindParentDragListener();
    }

    bindParentDragListener() {
        if (!this.parentDragSubscription && this.$appendTo() !== 'self' && this.targetEl) {
            this.parentDragSubscription = this.overlayService.parentDragObservable.subscribe((container: Element) => {
                if (container.contains(this.targetEl)) {
                    this.hide(this.overlayEl, true);
                }
            });
        }
    }

    unbindParentDragListener() {
        if (this.parentDragSubscription) {
            this.parentDragSubscription.unsubscribe();
            this.parentDragSubscription = null;
        }
    }

    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.targetEl, (event: any) => {
                const valid = this.listener ? this.listener(event, { type: 'scroll', mode: this.overlayMode, valid: true }) : true;

                valid && this.hide(event, true);
            });
        }

        this.scrollHandler.bindScrollListener();
    }

    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }

    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            this.documentClickListener = this.renderer.listen(this.document, 'click', (event) => {
                const isTargetClicked = this.targetEl && ((this.targetEl as any).isSameNode(event.target) || (!this.isOverlayClicked && (this.targetEl as any).contains(event.target)));
                const isOutsideClicked = !isTargetClicked && !this.isOverlayContentClicked;
                const valid = this.listener ? this.listener(event, { type: 'outside', mode: this.overlayMode, valid: event.which !== 3 && isOutsideClicked }) : isOutsideClicked;

                valid && this.hide(event);
                this.isOverlayClicked = this.isOverlayContentClicked = false;
            });
        }
    }

    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }

    bindDocumentResizeListener() {
        if (!this.documentResizeListener) {
            this.documentResizeListener = this.renderer.listen(this.document.defaultView, 'resize', (event) => {
                const valid = this.listener ? this.listener(event, { type: 'resize', mode: this.overlayMode, valid: !isTouchDevice() }) : !isTouchDevice();

                valid && this.hide(event, true);
            });
        }
    }

    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            this.documentResizeListener();
            this.documentResizeListener = null;
        }
    }

    bindDocumentKeyboardListener(): void {
        if (this.documentKeyboardListener) {
            return;
        }

        this.zone.runOutsideAngular(() => {
            this.documentKeyboardListener = this.renderer.listen(this.document.defaultView, 'keydown', (event) => {
                if (this.overlayOptions.hideOnEscape === false || event.code !== 'Escape') {
                    return;
                }

                const valid = this.listener ? this.listener(event, { type: 'keydown', mode: this.overlayMode, valid: !isTouchDevice() }) : !isTouchDevice();

                if (valid) {
                    this.zone.run(() => {
                        this.hide(event, true);
                    });
                }
            });
        });
    }

    unbindDocumentKeyboardListener(): void {
        if (this.documentKeyboardListener) {
            this.documentKeyboardListener();
            this.documentKeyboardListener = null;
        }
    }

    onDestroy() {
        this.hide(this.overlayEl, true);

        if (this.overlayEl && this.$appendTo() !== 'self') {
            this.renderer.appendChild(this.el.nativeElement, this.overlayEl);
            ZIndexUtils.clear(this.overlayEl);
        }

        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }

        this.unbindListeners();
    }
}

@NgModule({
    imports: [Overlay, SharedModule],
    exports: [Overlay, SharedModule]
})
export class OverlayModule {}
