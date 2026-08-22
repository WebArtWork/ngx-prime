import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    ContentChildren,
    ElementRef,
    inject,
    InjectionToken,
    input,
    NgModule,
    output,
    QueryList,
    signal,
    TemplateRef,
    ViewEncapsulation,
    viewChild,
    contentChild
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { MotionEvent, MotionOptions } from '@wawjs/css-prime-motion';
import { appendChild, focus } from '@wawjs/css-prime-utils';
import { PrimeTemplate, SharedModule } from 'ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from 'ngx-prime/basecomponent';
import { Bind, BindModule } from 'ngx-prime/bind';
import { blockBodyScroll, unblockBodyScroll } from 'ngx-prime/dom';
import { FocusTrap } from 'ngx-prime/focustrap';
import { EyeIcon, RefreshIcon, SearchMinusIcon, SearchPlusIcon, TimesIcon, UndoIcon } from 'ngx-prime/icons';
import { MotionModule } from 'ngx-prime/motion';
import { Nullable } from 'ngx-prime/ts-helpers';
import { ImageImageTemplateContext, ImagePassThrough, ImagePreviewTemplateContext } from 'ngx-prime/types/image';
import { ZIndexUtils } from 'ngx-prime/utils';
import { ImageStyle } from './style/imagestyle';

const IMAGE_INSTANCE = new InjectionToken<Image>('IMAGE_INSTANCE');

/**
 * Displays an image with preview and tranformation options. For multiple image, see Galleria.
 * @group Components
 */
@Component({
    selector: 'p-image',
    standalone: true,
    imports: [CommonModule, RefreshIcon, EyeIcon, UndoIcon, SearchMinusIcon, SearchPlusIcon, TimesIcon, FocusTrap, SharedModule, BindModule, MotionModule],
    template: `
        @if (!imageTemplate() && !_imageTemplate) {
            <img
                [attr.src]="src()"
                [attr.srcset]="srcSet()"
                [attr.sizes]="sizes()"
                [attr.alt]="alt()"
                [attr.width]="width()"
                [attr.height]="height()"
                [attr.loading]="loading()"
                [ngStyle]="imageStyle()"
                [class]="imageClass()"
                (error)="imageError($event)"
                [pBind]="ptm('image')"
            />
        }

        <ng-container *ngTemplateOutlet="imageTemplate() || _imageTemplate; context: { errorCallback: imageError.bind(this) }"></ng-container>

        @if (preview()) {
            <button [attr.aria-label]="zoomImageAriaLabel" type="button" [class]="cx('previewMask')" (click)="onImageClick()" #previewButton [ngStyle]="{ height: height() + 'px', width: width() + 'px' }" [pBind]="ptm('previewMask')">
                @if (indicatorTemplate || _indicatorTemplate) {
                    <ng-container *ngTemplateOutlet="indicatorTemplate || _indicatorTemplate"></ng-container>
                } @else {
                    <svg data-p-icon="eye" [class]="cx('previewIcon')" [pBind]="ptm('previewIcon')" />
                }
            </button>
        }
        @if (renderMask()) {
            <div
                #mask
                [class]="cx('mask')"
                [attr.aria-modal]="maskVisible"
                role="dialog"
                (click)="onMaskClick()"
                (keydown)="onMaskKeydown($event)"
                pFocusTrap
                [pBind]="ptm('mask')"
                [pMotion]="maskVisible"
                [pMotionAppear]="true"
                [pMotionEnterActiveClass]="'p-overlay-mask-enter-active'"
                [pMotionLeaveActiveClass]="'p-overlay-mask-leave-active'"
                [pMotionOptions]="computedMaskMotionOptions()"
                (pMotionOnAfterLeave)="onMaskAfterLeave()"
            >
                <div [class]="cx('toolbar')" (click)="handleToolbarClick($event)" [pBind]="ptm('toolbar')">
                    <button [class]="cx('rotateRightButton')" (click)="rotateRight()" type="button" [attr.aria-label]="rightAriaLabel()" [pBind]="ptm('rotateRightButton')">
                        @if (!rotateRightIconTemplate() && !_rotateRightIconTemplate) {
                            <svg data-p-icon="refresh" />
                        }
                        <ng-template *ngTemplateOutlet="rotateRightIconTemplate() || _rotateRightIconTemplate"></ng-template>
                    </button>
                    <button [class]="cx('rotateLeftButton')" (click)="rotateLeft()" type="button" [attr.aria-label]="leftAriaLabel()" [pBind]="ptm('rotateLeftButton')">
                        @if (!rotateLeftIconTemplate() && !_rotateLeftIconTemplate) {
                            <svg data-p-icon="undo" />
                        }
                        <ng-template *ngTemplateOutlet="rotateLeftIconTemplate() || _rotateLeftIconTemplate"></ng-template>
                    </button>
                    <button [class]="cx('zoomOutButton')" (click)="zoomOut()" type="button" [disabled]="isZoomOutDisabled" [attr.aria-label]="zoomOutAriaLabel()" [pBind]="ptm('zoomOutButton')">
                        @if (!zoomOutIconTemplate() && !_zoomOutIconTemplate) {
                            <svg data-p-icon="search-minus" />
                        }
                        <ng-template *ngTemplateOutlet="zoomOutIconTemplate() || _zoomOutIconTemplate"></ng-template>
                    </button>
                    <button [class]="cx('zoomInButton')" (click)="zoomIn()" type="button" [disabled]="isZoomInDisabled" [attr.aria-label]="zoomInAriaLabel()" [pBind]="ptm('zoomInButton')">
                        @if (!zoomInIconTemplate() && !_zoomInIconTemplate) {
                            <svg data-p-icon="search-plus" />
                        }
                        <ng-template *ngTemplateOutlet="zoomInIconTemplate() || _zoomInIconTemplate"></ng-template>
                    </button>
                    <button [class]="cx('closeButton')" type="button" (click)="closePreview()" [attr.aria-label]="closeAriaLabel()" #closeButton [pBind]="ptm('closeButton')">
                        @if (!closeIconTemplate() && !_closeIconTemplate) {
                            <svg data-p-icon="times" />
                        }
                        <ng-template *ngTemplateOutlet="closeIconTemplate() || _closeIconTemplate"></ng-template>
                    </button>
                </div>
                @if (renderPreview()) {
                    <p-motion [visible]="previewVisible" name="p-image-original" [appear]="true" [options]="computedMotionOptions()" (onBeforeEnter)="onAnimationStart($event)" (onBeforeLeave)="onBeforeLeave()" (onAfterLeave)="onAnimationEnd($event)">
                        @if (!previewTemplate() && !_previewTemplate) {
                            <img
                                [attr.src]="previewImageSrc() ? previewImageSrc() : src()"
                                [attr.srcset]="previewImageSrcSet()"
                                [attr.sizes]="previewImageSizes()"
                                [class]="cx('original')"
                                [ngStyle]="imagePreviewStyle()"
                                (click)="onPreviewImageClick()"
                                [pBind]="ptm('original')"
                            />
                        }
                        <ng-container
                            *ngTemplateOutlet="
                                previewTemplate() || _previewTemplate;
                                context: {
                                    class: cx('original'),
                                    style: imagePreviewStyle(),
                                    previewCallback: onPreviewImageClick.bind(this)
                                }
                            "
                        >
                        </ng-container>
                    </p-motion>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ImageStyle, { provide: IMAGE_INSTANCE, useExisting: Image }, { provide: PARENT_INSTANCE, useExisting: Image }],
    host: {
        '[class]': "cn(cx('root'),styleClass())",
        '(document:keydown.escape)': 'onKeydownHandler()'
    },
    hostDirectives: [Bind]
})
export class Image extends BaseComponent<ImagePassThrough> {
    componentName = 'Image';

    $pcImage: Image | undefined = inject(IMAGE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });
    /**
     * Style class of the image element.
     * @group Props
     */
    imageClass = input<string>();
    /**
     * Inline style of the image element.
     * @group Props
     */
    imageStyle = input<{ [klass: string]: any } | null>();
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * The source path for the main image.
     * @group Props
     */
    src = input<string | SafeUrl>();
    /**
     * The srcset definition for the main image.
     * @group Props
     */
    srcSet = input<string | SafeUrl>();
    /**
     * The sizes definition for the main image.
     * @group Props
     */
    sizes = input<string>();
    /**
     * The source path for the preview image.
     * @group Props
     */
    previewImageSrc = input<string | SafeUrl>();
    /**
     * The srcset definition for the preview image.
     * @group Props
     */
    previewImageSrcSet = input<string | SafeUrl>();
    /**
     * The sizes definition for the preview image.
     * @group Props
     */
    previewImageSizes = input<string>();
    /**
     * Attribute of the preview image element.
     * @group Props
     */
    alt = input<string>();
    /**
     * Attribute of the image element.
     * @group Props
     */
    width = input<string>();
    /**
     * Attribute of the image element.
     * @group Props
     */
    height = input<string>();
    /**
     * Attribute of the image element.
     * @group Props
     */
    loading = input<'lazy' | 'eager'>();
    /**
     * Controls the preview functionality.
     * @group Props
     */
    preview = input(false, { transform: booleanAttribute });
    /**
     * Transition options of the show animation
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    showTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
    /**
     * Transition options of the hide animation
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    hideTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
    /**
     * Enter animation class name of modal.
     * @defaultValue 'p-modal-enter'
     * @group Props
     */
    modalEnterAnimation = input<string | null | undefined>('p-modal-enter');
    /**
     * Leave animation class name of modal.
     * @defaultValue 'p-modal-leave'
     * @group Props
     */
    modalLeaveAnimation = input<string | null | undefined>('p-modal-leave');
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'self'
     * @group Props
     */
    appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>(undefined);
    /**
     * The motion options for the mask.
     * @group Props
     */
    maskMotionOptions = input<MotionOptions | undefined>(undefined);

    computedMaskMotionOptions = computed<MotionOptions>(() => ({
        ...this.ptm('maskMotion'),
        ...this.maskMotionOptions()
    }));
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
     * Triggered when the preview overlay is shown.
     * @group Emits
     */
    onShow = output<any>();
    /**
     * Triggered when the preview overlay is hidden.
     * @group Emits
     */
    onHide = output<any>();
    /**
     * This event is triggered if an error occurs while loading an image file.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onImageError = output<Event>();

    readonly mask = viewChild<ElementRef>('mask');

    readonly previewButton = viewChild<ElementRef>('previewButton');

    readonly closeButton = viewChild<ElementRef>('closeButton');

    /**
     * Custom indicator template.
     * @group Templates
     */
    @ContentChild('indicator', { descendants: false }) indicatorTemplate: TemplateRef<void> | undefined;

    /**
     * Custom rotate right icon template.
     * @group Templates
     */
    readonly rotateRightIconTemplate = contentChild<TemplateRef<void>>('rotaterighticon', { descendants: false });

    /**
     * Custom rotate left icon template.
     * @group Templates
     */
    readonly rotateLeftIconTemplate = contentChild<TemplateRef<void>>('rotatelefticon', { descendants: false });

    /**
     * Custom zoom out icon template.
     * @group Templates
     */
    readonly zoomOutIconTemplate = contentChild<TemplateRef<void>>('zoomouticon', { descendants: false });

    /**
     * Custom zoom in icon template.
     * @group Templates
     */
    readonly zoomInIconTemplate = contentChild<TemplateRef<void>>('zoominicon', { descendants: false });

    /**
     * Custom close icon template.
     * @group Templates
     */
    readonly closeIconTemplate = contentChild<TemplateRef<void>>('closeicon', { descendants: false });

    /**
     * Custom preview template.
     * @group Templates
     */
    readonly previewTemplate = contentChild<TemplateRef<ImagePreviewTemplateContext>>('preview', { descendants: false });

    /**
     * Custom image template.
     * @group Templates
     */
    readonly imageTemplate = contentChild<TemplateRef<ImageImageTemplateContext>>('image', { descendants: false });

    renderMask = signal<boolean>(false);

    renderPreview = signal<boolean>(false);

    maskVisible: boolean = false;

    previewVisible: boolean = false;

    rotate: number = 0;

    scale: number = 1;

    previewClick: boolean = false;

    container: Nullable<HTMLElement>;

    wrapper: Nullable<HTMLElement>;

    _componentStyle = inject(ImageStyle);

    $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    public get isZoomOutDisabled(): boolean {
        return this.scale - this.zoomSettings.step <= this.zoomSettings.min;
    }

    public get isZoomInDisabled(): boolean {
        return this.scale + this.zoomSettings.step >= this.zoomSettings.max;
    }

    private zoomSettings = {
        default: 1,
        step: 0.1,
        max: 1.5,
        min: 0.5
    };

    @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate> | undefined;

    _indicatorTemplate: TemplateRef<void> | undefined;

    _rotateRightIconTemplate: TemplateRef<void> | undefined;

    _rotateLeftIconTemplate: TemplateRef<void> | undefined;

    _zoomOutIconTemplate: TemplateRef<void> | undefined;

    _zoomInIconTemplate: TemplateRef<void> | undefined;

    _closeIconTemplate: TemplateRef<void> | undefined;

    _imageTemplate: TemplateRef<ImageImageTemplateContext> | undefined;

    _previewTemplate: TemplateRef<ImagePreviewTemplateContext> | undefined;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    onAfterContentInit() {
        this.templates?.forEach((item) => {
            switch (item.getType()) {
                case 'indicator':
                    this._indicatorTemplate = item.template;
                    break;

                case 'rotaterighticon':
                    this._rotateRightIconTemplate = item.template;
                    break;

                case 'rotatelefticon':
                    this._rotateLeftIconTemplate = item.template;
                    break;

                case 'zoomouticon':
                    this._zoomOutIconTemplate = item.template;
                    break;

                case 'zoominicon':
                    this._zoomInIconTemplate = item.template;
                    break;

                case 'closeicon':
                    this._closeIconTemplate = item.template;
                    break;

                case 'image':
                    this._imageTemplate = item.template;
                    break;

                case 'preview':
                    this._previewTemplate = item.template;
                    break;

                default:
                    this._indicatorTemplate = item.template;
                    break;
            }
        });
    }

    onImageClick() {
        if (this.preview()) {
            this.maskVisible = true;
            this.previewVisible = true;
            this.renderMask.set(true);
            this.renderPreview.set(true);
            blockBodyScroll();
        }
    }

    onMaskClick() {
        if (!this.previewClick) {
            this.closePreview();
        }

        this.previewClick = false;
    }

    onMaskKeydown(event: KeyboardEvent) {
        switch (event.code) {
            case 'Escape':
                this.onMaskClick();
                setTimeout(() => {
                    focus(this.previewButton()?.nativeElement);
                }, 25);
                event.preventDefault();

                break;

            default:
                break;
        }
    }

    onPreviewImageClick() {
        this.previewClick = true;
    }

    rotateRight() {
        this.rotate += 90;
        this.previewClick = true;
    }

    rotateLeft() {
        this.rotate -= 90;
        this.previewClick = true;
    }

    zoomIn() {
        this.scale = this.scale + this.zoomSettings.step;
        this.previewClick = true;
    }

    zoomOut() {
        this.scale = this.scale - this.zoomSettings.step;
        this.previewClick = true;
    }

    onAnimationStart(event: MotionEvent) {
        this.container = event.element as HTMLDivElement;
        this.wrapper = this.container?.parentElement;
        this.$attrSelector && this.wrapper?.setAttribute(this.$attrSelector, '');
        this.appendContainer();
        this.moveOnTop();
        this.onShow.emit({});
        setTimeout(() => {
            focus(this.closeButton()?.nativeElement);
        }, 25);
    }

    onBeforeLeave() {
        this.maskVisible = false;
    }

    onAnimationEnd() {
        this.renderPreview.set(false);
    }

    onMaskAfterLeave() {
        if (!this.renderPreview()) {
            this.renderMask.set(false);
        }

        ZIndexUtils.clear(this.wrapper);
        this.container = null;
        this.wrapper = null;
        this.rotate = 0;
        this.scale = this.zoomSettings.default;
        unblockBodyScroll();
        this.onHide.emit({});
        this.cd.markForCheck();
    }

    moveOnTop() {
        ZIndexUtils.set('modal', this.wrapper, this.config.zIndex.modal);
    }

    appendContainer() {
        if (this.$appendTo() && this.$appendTo() !== 'self') {
            if (this.$appendTo() === 'body' && this.wrapper) {
                this.document.body.appendChild(this.wrapper as HTMLElement);
            } else if (this.wrapper) {
                appendChild(this.$appendTo(), this.wrapper);
            }
        }
    }

    imagePreviewStyle() {
        return { transform: 'rotate(' + this.rotate + 'deg) scale(' + this.scale + ')' };
    }

    get zoomImageAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.zoomImage : undefined;
    }

    handleToolbarClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    closePreview(): void {
        this.previewVisible = false;
    }

    imageError(event: Event) {
        this.onImageError.emit(event);
    }

    rightAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.rotateRight : undefined;
    }

    leftAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.rotateLeft : undefined;
    }

    zoomInAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.zoomIn : undefined;
    }

    zoomOutAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.zoomOut : undefined;
    }

    closeAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.close : undefined;
    }

    onKeydownHandler() {
        if (this.previewVisible) {
            this.closePreview();
        }
    }
}

@NgModule({
    imports: [Image, SharedModule],
    exports: [Image, SharedModule]
})
export class ImageModule {}
