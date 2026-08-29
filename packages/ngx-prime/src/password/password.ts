import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    input,
    isDevMode,
    NgModule,
    NgZone,
    numberAttribute,
    output,
    Pipe,
    PipeTransform,
    signal,
    TemplateRef,
    ViewEncapsulation,
    viewChild,
    contentChild,
    contentChildren
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MotionOptions } from '@wawjs/css-prime-motion';
import { absolutePosition, addClass, hasClass, isTouchDevice, removeClass } from '@wawjs/css-prime-utils';
import { OverlayOptions, OverlayService, PrimeTemplate, SharedModule, TranslationKeys } from '@wawjs/ngx-prime/api';
import { AutoFocus } from '@wawjs/ngx-prime/autofocus';
import { PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { BaseEditableHolder } from '@wawjs/ngx-prime/baseeditableholder';
import { BaseInput } from '@wawjs/ngx-prime/baseinput';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import { ConnectedOverlayScrollHandler, DomHandler } from '@wawjs/ngx-prime/dom';
import { Fluid } from '@wawjs/ngx-prime/fluid';
import { EyeIcon, EyeSlashIcon, TimesIcon } from '@wawjs/ngx-prime/icons';
import { InputText } from '@wawjs/ngx-prime/inputtext';
import { Overlay } from '@wawjs/ngx-prime/overlay';
import { Nullable, VoidListener } from '@wawjs/ngx-prime/ts-helpers';
import type { PasswordIconTemplateContext, PasswordPassThrough } from '@wawjs/ngx-prime/types/password';
import { Subscription } from 'rxjs';
import { PasswordStyle } from './style/passwordstyle';

const PASSWORD_DIRECTIVE_INSTANCE = new InjectionToken<PasswordDirective>('PASSWORD_DIRECTIVE_INSTANCE');

const PASSWORD_INSTANCE = new InjectionToken<Password>('PASSWORD_INSTANCE');

type Meter = {
    strength: string;
    width: string;
};
/**
 * Adds password feedback and form integration to a native input.
 * @group Components
 */
@Directive({
    selector: 'input[pPassword]',
    standalone: true,
    exportAs: 'pPassword',
    host: {
        '[class]': "cx('rootDirective')",
        '(input)': 'onInput($event)',
        '(focus)': 'handleFocus($event)',
        '(blur)': 'handleBlur($event)',
        '(keyup)': 'onKeyup($event)',
        '(keydown.escape)': 'hideOverlay()'
    },
    providers: [PasswordStyle, { provide: PASSWORD_DIRECTIVE_INSTANCE, useExisting: PasswordDirective }, { provide: PARENT_INSTANCE, useExisting: PasswordDirective }],
    hostDirectives: [Bind]
})
export class PasswordDirective extends BaseEditableHolder {
    zone = inject(NgZone);

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcPasswordDirective: PasswordDirective | undefined = inject(PASSWORD_DIRECTIVE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    /**
     * Used to pass attributes to DOM elements inside the Password component.
     * @defaultValue undefined
     * @group Props
     */
    pPasswordPT = input<PasswordPassThrough | undefined>();
    /**
     * Indicates whether the component should be rendered without styles.
     * @defaultValue undefined
     * @group Props
     */
    pPasswordUnstyled = input<boolean | undefined>();

    /** Signals that a Signal Forms field has been touched. */
    touch = output<void>();

    /** Emits when the native input receives focus. */
    onFocus = output<Event>();

    /** Emits when the native input loses focus. */
    onBlur = output<Event>();

    /** Emits whenever the password visibility changes. */
    onMaskChange = output<boolean>();

    /** Emits after a native password input has been cleared. */
    onClear = output<void>();

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * Text to prompt password entry. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    promptLabel = input('Enter a password');
    /**
     * Text for a weak password. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    weakLabel = input('Weak');
    /**
     * Text for a medium password. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    mediumLabel = input('Medium');
    /**
     * Text for a strong password. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    strongLabel = input('Strong');

    /** Regex used to classify medium-strength passwords. */
    mediumRegex = input('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');

    /** Regex used to classify strong passwords. */
    strongRegex = input('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');
    /**
     * Whether to show the strength indicator or not.
     * @group Props
     */
    feedback = input(true, { transform: booleanAttribute });
    /**
     * Sets the visibility of the password field.
     * @defaultValue false
     * @type boolean
     * @group Props
     */
    showPassword = input(false, { transform: booleanAttribute });

    /** Whether the native input is currently shown as plain text. */
    readonly visible = signal(false);
    /**
     * Specifies the input variant of the component.
     * @defaultValue 'outlined'
     * @group Props
     */
    variant = input<'filled' | 'outlined' | undefined>();
    /**
     * Spans 100% width of the container when enabled.
     * @defaultValue false
     * @group Props
     */
    fluid = input(undefined, { transform: booleanAttribute });
    /**
     * Specifies the size of the component.
     * @defaultValue undefined
     * @group Props
     */
    // eslint-disable-next-line @angular-eslint/no-input-rename -- `pSize` is published public API; renaming would break consumers.
    size = input<'large' | 'small' | undefined>(undefined, { alias: 'pSize' });

    pcFluid: Fluid | null = inject(Fluid, { optional: true, host: true, skipSelf: true });

    $variant = computed(() => this.variant() || this.config.inputStyle() || this.config.inputVariant());

    get hasFluid() {
        return this.fluid() ?? !!this.pcFluid;
    }

    panel: Nullable<HTMLDivElement>;

    meter: Nullable<HTMLDivElement>;

    info: Nullable<HTMLDivElement>;

    filled: Nullable<boolean>;

    content: Nullable<HTMLDivElement>;

    label: Nullable<HTMLLabelElement>;

    scrollHandler: Nullable<ConnectedOverlayScrollHandler>;

    documentResizeListener: VoidListener;

    _componentStyle = inject(PasswordStyle);

    constructor() {
        super();

        effect(() => {
            const pt = this.pPasswordPT();

            pt && this.directivePT.set(pt);
        });

        effect(() => {
            this.pPasswordUnstyled() && this.directiveUnstyled.set(this.pPasswordUnstyled());
        });

        effect(() => {
            this.setVisible(this.showPassword(), false);
        });
    }

    onInput(event?: Event) {
        const input = (event?.target as HTMLInputElement | undefined) ?? this.el.nativeElement;

        this.writeModelValue(input.value);
        this.updateFeedback();
    }

    createPanel() {
        if (isPlatformBrowser(this.platformId)) {
            this.panel = this.renderer.createElement('div');
            this.renderer.addClass(this.panel, 'p-password-overlay');
            this.renderer.addClass(this.panel, 'p-component');
            this.renderer.setAttribute(this.panel, 'role', 'status');
            this.renderer.setAttribute(this.panel, 'aria-live', 'polite');

            this.content = this.renderer.createElement('div');
            this.renderer.addClass(this.content, 'p-password-content');
            this.renderer.appendChild(this.panel, this.content);

            this.meter = this.renderer.createElement('div');
            this.renderer.addClass(this.meter, 'p-password-meter');
            this.renderer.appendChild(this.content, this.meter);

            this.label = this.renderer.createElement('div');
            this.renderer.addClass(this.label, 'p-password-meter-label');
            this.renderer.appendChild(this.meter, this.label);

            this.info = this.renderer.createElement('div');
            this.renderer.addClass(this.info, 'p-password-meter-text');
            this.renderer.setProperty(this.info, 'textContent', this.promptLabel());
            this.renderer.appendChild(this.content, this.info);

            this.renderer.setStyle(this.panel, 'minWidth', `${this.el.nativeElement.offsetWidth}px`);
            this.renderer.appendChild(document.body, this.panel);
            this.updateMeter();
        }
    }

    showOverlay() {
        if (this.feedback()) {
            if (!this.panel) {
                this.createPanel();
            }

            this.renderer.setStyle(this.panel, 'zIndex', String(++DomHandler.zindex));
            this.renderer.setStyle(this.panel, 'display', 'block');
            this.zone.runOutsideAngular(() => {
                setTimeout(() => {
                    addClass(this.panel!, 'p-connected-overlay-visible');
                    this.bindScrollListener();
                    this.bindDocumentResizeListener();
                }, 1);
            });
            absolutePosition(this.panel!, this.el.nativeElement);
        }
    }

    hideOverlay() {
        if (this.feedback() && this.panel) {
            addClass(this.panel, 'p-connected-overlay-hidden');
            removeClass(this.panel, 'p-connected-overlay-visible');
            this.unbindScrollListener();
            this.unbindDocumentResizeListener();

            this.zone.runOutsideAngular(() => {
                setTimeout(() => {
                    this.onDestroy();
                }, 150);
            });
        }
    }

    handleFocus(event?: Event) {
        this.showOverlay();
        this.onFocus.emit(event!);
    }

    handleBlur(event?: Event) {
        this.hideOverlay();
        this.touch.emit();
        this.onBlur.emit(event!);
    }

    labelSignal = signal('');

    onKeyup(e: Event) {
        if (this.feedback()) {
            let value = (e.target as HTMLInputElement).value,
                label: string | null = null,
                meterPos: string | null = null;

            if (value.length === 0) {
                label = this.promptLabel();
                meterPos = '0px 0px';
            } else {
                const score = this.testStrength(value);

                if (score < 30) {
                    label = this.weakLabel();
                    meterPos = '0px -10px';
                } else if (score >= 30 && score < 80) {
                    label = this.mediumLabel();
                    meterPos = '0px -20px';
                } else if (score >= 80) {
                    label = this.strongLabel();
                    meterPos = '0px -30px';
                }

                this.labelSignal.set(label!);
                this.updateMeter();
            }

            if (!this.panel || !hasClass(this.panel, 'p-connected-overlay-visible')) {
                this.showOverlay();
            }

            if (this.meter) {
                this.renderer.setStyle(this.meter, 'backgroundPosition', meterPos);
            }

            if (this.info) {
                (this.info as HTMLDivElement).textContent = label;
            }
        }
    }

    updateMeter() {
        if (this.labelSignal() && this.meter && this.info) {
            const label = this.labelSignal();
            const strengthClass = this.strengthClass(label.toLowerCase());
            const width = this.getWidth(label.toLowerCase());

            this.renderer.addClass(this.meter, strengthClass);
            this.renderer.setStyle(this.meter, 'width', width);
            (this.info as HTMLDivElement).textContent = label;
        }
    }

    /** Toggles between password and plain-text display while preserving focus. */
    toggleMask() {
        this.setVisible(!this.visible());
        this.focus();
    }

    focus(options?: FocusOptions) {
        this.el.nativeElement.focus(options);
    }

    clear() {
        this.el.nativeElement.value = '';
        this.writeModelValue('');
        this.updateFeedback();
        this.el.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.onClear.emit();
        this.focus();
    }

    private setVisible(visible: boolean, emit = true) {
        this.visible.set(visible);
        this.el.nativeElement.type = visible ? 'text' : 'password';

        if (emit) {
            this.onMaskChange.emit(visible);
        }
    }

    private updateFeedback() {
        if (this.feedback()) {
            this.onKeyup({ target: this.el.nativeElement } as Event);
        }
    }

    getWidth(label: string) {
        return label === 'weak' ? '33.33%' : label === 'medium' ? '66.66%' : label === 'strong' ? '100%' : '';
    }

    strengthClass(label) {
        return `p-password-meter${label ? `-${label}` : ''}`;
    }

    testStrength(str: string) {
        let grade: number = 0;
        let val: Nullable<RegExpMatchArray>;

        if (new RegExp(this.strongRegex()).test(str)) return 100;
        if (new RegExp(this.mediumRegex()).test(str)) return 50;

        val = str.match('[0-9]');
        grade += this.normalize(val ? val.length : 1 / 4, 1) * 25;

        val = str.match('[a-zA-Z]');
        grade += this.normalize(val ? val.length : 1 / 2, 3) * 10;

        val = str.match('[!@#$%^&*?_~.,;=]');
        grade += this.normalize(val ? val.length : 1 / 6, 1) * 35;

        val = str.match('[A-Z]');
        grade += this.normalize(val ? val.length : 1 / 6, 1) * 30;

        grade *= str.length / 8;

        return grade > 100 ? 100 : grade;
    }

    normalize(x: number, y: number) {
        let diff = x - y;

        if (diff <= 0) return x / y;
        else return 1 + 0.5 * (x / (x + y / 4));
    }

    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.el.nativeElement, () => {
                if (hasClass(this.panel!, 'p-connected-overlay-visible')) {
                    this.hideOverlay();
                }
            });
        }

        this.scrollHandler.bindScrollListener();
    }

    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }

    bindDocumentResizeListener() {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.documentResizeListener) {
                const window = this.document.defaultView as Window;

                this.documentResizeListener = this.renderer.listen(window, 'resize', this.onWindowResize.bind(this));
            }
        }
    }

    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            this.documentResizeListener();
            this.documentResizeListener = null;
        }
    }

    onWindowResize() {
        if (!isTouchDevice()) {
            this.hideOverlay();
        }
    }

    onDestroy() {
        if (this.panel) {
            if (this.scrollHandler) {
                this.scrollHandler.destroy();
                this.scrollHandler = null;
            }

            this.unbindDocumentResizeListener();

            this.renderer.removeChild(this.document.body, this.panel);
            this.panel = null;
            this.meter = null;
            this.info = null;
        }
    }
}

/**
 * Attaches an accessible visibility toggle to a native `pPassword` input.
 *
 * @example
 * ```html
 * <input pPassword #password="pPassword" />
 * <button type="button" [pPasswordToggleMask]="password">Show password</button>
 * ```
 */
@Directive({
    selector: 'button[pPasswordToggleMask]',
    standalone: true,
    host: {
        type: 'button',
        class: 'p-password-toggle-mask-icon',
        '[attr.aria-pressed]': 'password().visible()',
        '[attr.aria-label]': 'ariaLabel()',
        '[disabled]': 'password().el.nativeElement.disabled',
        '(click)': 'toggle()'
    }
})
export class PasswordToggleMaskDirective {
    password = input.required<PasswordDirective>({ alias: 'pPasswordToggleMask' });
    showLabel = input('Show password');
    hideLabel = input('Hide password');

    ariaLabel = computed(() => (this.password().visible() ? this.hideLabel() : this.showLabel()));

    toggle() {
        if (!this.password().el.nativeElement.disabled && !this.password().el.nativeElement.readOnly) {
            this.password().toggleMask();
        }
    }
}

/** Clears a native `pPassword` input while retaining normal form semantics. */
@Directive({
    selector: 'button[pPasswordClear]',
    standalone: true,
    host: {
        type: 'button',
        class: 'p-password-clear-icon',
        '[attr.aria-label]': 'ariaLabel()',
        '[disabled]': 'password().el.nativeElement.disabled',
        '(click)': 'clear()'
    }
})
export class PasswordClearDirective {
    password = input.required<PasswordDirective>({ alias: 'pPasswordClear' });
    ariaLabel = input('Clear password');

    clear() {
        if (!this.password().el.nativeElement.disabled && !this.password().el.nativeElement.readOnly) {
            this.password().clear();
        }
    }
}

type Mapper<T, G> = (item: T, ...args: any[]) => G;

@Pipe({
    name: 'mapper',
    pure: true,
    standalone: true
})
export class MapperPipe implements PipeTransform {
    public transform<T, G>(value: T, mapper: Mapper<T, G>, ...args: unknown[]): G {
        return mapper(value, ...args);
    }
}

export const Password_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Password),
    multi: true
};
/**
 * Password displays strength indicator for password fields.
 *
 * @deprecated Use a native `<input type="password" pPassword>` instead.
 * Compose optional visibility and clear controls with `pPasswordToggleMask`
 * and `pPasswordClear`. This component remains available for compatibility
 * and is planned for removal in v23.
 * @group Components
 */
@Component({
    selector: 'p-password',
    standalone: true,
    imports: [CommonModule, InputText, AutoFocus, TimesIcon, EyeSlashIcon, EyeIcon, Overlay, SharedModule, BindModule],
    template: `
        <input
            #input
            [attr.label]="label()"
            [attr.aria-label]="ariaLabel()"
            [attr.aria-labelledBy]="ariaLabelledBy()"
            [attr.id]="inputId()"
            [attr.tabindex]="tabindex()"
            pInputText
            [pSize]="size()"
            [ngStyle]="inputStyle()"
            [class]="cn(cx('pcInputText'), inputStyleClass())"
            [attr.type]="unmasked ? 'text' : 'password'"
            [attr.placeholder]="placeholder()"
            [attr.autocomplete]="autocomplete()"
            [value]="value"
            [variant]="$variant()"
            [attr.name]="name()"
            [attr.maxlength]="maxlength() || maxLength()"
            [attr.minlength]="minlength()"
            [attr.required]="required() ? '' : undefined"
            [attr.disabled]="$disabled() ? '' : undefined"
            [invalid]="invalid()"
            (input)="onInput($event)"
            (focus)="onInputFocus($event)"
            (blur)="onInputBlur($event)"
            (keyup)="onKeyUp($event)"
            [pAutoFocus]="autofocus()"
            [pt]="ptm('pcInputText')"
            [unstyled]="unstyled()"
        />
        @if (showClear() && value != null) {
            @if (!clearIconTemplate() && !_clearIconTemplate) {
                <svg data-p-icon="times" [class]="cx('clearIcon')" role="button" tabindex="0" [attr.aria-label]="clearIconAriaLabel" (click)="clear()" (keydown.enter)="clear()" (keydown.space)="onClearSpace($event)" [pBind]="ptm('clearIcon')" />
            }
            <span role="button" tabindex="0" [attr.aria-label]="clearIconAriaLabel" (click)="clear()" (keydown.enter)="clear()" (keydown.space)="onClearSpace($event)" [class]="cx('clearIcon')" [pBind]="ptm('clearIcon')">
                <ng-template *ngTemplateOutlet="clearIconTemplate() || _clearIconTemplate"></ng-template>
            </span>
        }

        @if (toggleMask()) {
            @if (unmasked) {
                @if (!hideIconTemplate && !_hideIconTemplate) {
                    <svg data-p-icon="eyeslash" [class]="cx('maskIcon')" [pBind]="ptm('maskIcon')" role="button" tabindex="0" [attr.aria-label]="hideIconAriaLabel" (click)="onMaskToggle()" (keydown.enter)="onMaskToggle()" (keydown.space)="onMaskToggleSpace($event)" />
                }
                @if (hideIconTemplate || _hideIconTemplate) {
                    <span role="button" tabindex="0" [attr.aria-label]="hideIconAriaLabel" (click)="onMaskToggle()" (keydown.enter)="onMaskToggle()" (keydown.space)="onMaskToggleSpace($event)" [pBind]="ptm('maskIcon')">
                        <ng-template *ngTemplateOutlet="hideIconTemplate || _hideIconTemplate; context: { class: cx('maskIcon') }"></ng-template>
                    </span>
                }
            }
            @if (!unmasked) {
                @if (!showIconTemplate && !_showIconTemplate) {
                    <svg data-p-icon="eye" [class]="cx('unmaskIcon')" [pBind]="ptm('unmaskIcon')" role="button" tabindex="0" [attr.aria-label]="showIconAriaLabel" (click)="onMaskToggle()" (keydown.enter)="onMaskToggle()" (keydown.space)="onMaskToggleSpace($event)" />
                }
                @if (showIconTemplate || _showIconTemplate) {
                    <span role="button" tabindex="0" [attr.aria-label]="showIconAriaLabel" (click)="onMaskToggle()" (keydown.enter)="onMaskToggle()" (keydown.space)="onMaskToggleSpace($event)" [pBind]="ptm('unmaskIcon')">
                        <ng-template *ngTemplateOutlet="showIconTemplate || _showIconTemplate; context: { class: cx('unmaskIcon') }"></ng-template>
                    </span>
                }
            }
        }

        <p-overlay #overlay [hostAttrSelector]="$attrSelector" [(visible)]="overlayVisible" [options]="overlayOptions()" [target]="'@parent'" [appendTo]="$appendTo()" [unstyled]="unstyled()" [pt]="ptm('pcOverlay')" [motionOptions]="motionOptions()">
            <ng-template #content>
                <div [class]="cx('overlay')" [style]="sx('overlay')" role="status" aria-live="polite" (click)="onOverlayClick($event)" [pBind]="ptm('overlay')" [attr.data-p]="overlayDataP">
                    <ng-container *ngTemplateOutlet="headerTemplate() || _headerTemplate"></ng-container>
                    @if (contentTemplate || _contentTemplate) {
                        <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate"></ng-container>
                    } @else {
                        <div [class]="cx('content')" [pBind]="ptm('content')">
                            <div [class]="cx('meter')" [pBind]="ptm('meter')">
                                <div [class]="cx('meterLabel')" [ngStyle]="{ width: meter ? meter.width : '' }" [pBind]="ptm('meterLabel')" [attr.data-p]="meterDataP"></div>
                            </div>
                            <div [class]="cx('meterText')" [pBind]="ptm('meterText')">{{ infoText }}</div>
                        </div>
                    }
                    <ng-container *ngTemplateOutlet="footerTemplate() || _footerTemplate"></ng-container>
                </div>
            </ng-template>
        </p-overlay>
    `,
    providers: [Password_VALUE_ACCESSOR, PasswordStyle, { provide: PASSWORD_INSTANCE, useExisting: Password }, { provide: PARENT_INSTANCE, useExisting: Password }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[style]': "sx('root')",
        '[attr.data-p]': 'containerDataP',
        '(focus)': 'onFocus.emit($event)',
        '(blur)': 'onBlur.emit($event)',
        '(keyup)': 'onKeyUp($event)'
    },
    hostDirectives: [Bind]
})
export class Password extends BaseInput<PasswordPassThrough> {
    componentName = 'Password';

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcPassword: Password | undefined = inject(PASSWORD_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    constructor() {
        super();

        if (isDevMode()) {
            // eslint-disable-next-line no-console
            console.warn('`<p-password>` is deprecated and will be removed in a future major version. ' + 'Use a native `<input type="password" pPassword>` instead.');
        }
    }

    /**
     * Defines a string that labels the input for accessibility.
     * @group Props
     */
    ariaLabel = input<string>();
    /**
     * Specifies one or more IDs in the DOM that labels the input field.
     * @group Props
     */
    ariaLabelledBy = input<string>();
    /**
     * Label of the input for accessibility.
     * @group Props
     */
    label = input<string>();
    /**
     * Text to prompt password entry. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    promptLabel = input<string>();
    /**
     * Regex value for medium regex.
     * @group Props
     */
    mediumRegex = input('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');
    /**
     * Regex value for strong regex.
     * @group Props
     */
    strongRegex = input('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');
    /**
     * Text for a weak password. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    weakLabel = input<string>();
    /**
     * Text for a medium password. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    mediumLabel = input<string>();
    /**
     * specifies the maximum number of characters allowed in the input element.
     * @deprecated since v20.0.0, use maxlength instead.
     * @group Props
     */
    maxLength = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * Text for a strong password. Defaults to ngx-prime I18N API configuration.
     * @group Props
     */
    strongLabel = input<string>();
    /**
     * Identifier of the accessible input element.
     * @group Props
     */
    inputId = input<string>();
    /**
     * Whether to show the strength indicator or not.
     * @group Props
     */
    feedback = input(true, { transform: booleanAttribute });
    /**
     * Whether to show an icon to display the password as plain text.
     * @group Props
     */
    toggleMask = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Style class of the input field.
     * @group Props
     */
    inputStyleClass = input<string>();
    /**
     * Style class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Inline style of the input field.
     * @group Props
     */
    inputStyle = input<{ [klass: string]: any } | null>();
    /**
     * Transition options of the show animation.
     * @group Props
     * @deprecated since v21.0.0, use `motionOptions` instead.
     */
    showTransitionOptions = input('.12s cubic-bezier(0, 0, 0.2, 1)');
    /**
     * Transition options of the hide animation.
     * @group Props
     * @deprecated since v21.0.0, use `motionOptions` instead.
     */
    hideTransitionOptions = input('.1s linear');
    /**
     * Specify automated assistance in filling out password by browser.
     * @group Props
     */
    autocomplete = input<string>();
    /**
     * Advisory information to display on input.
     * @group Props
     */
    placeholder = input<string>();
    /**
     * When enabled, a clear icon is displayed to clear the value.
     * @group Props
     */
    showClear = input(false, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    autofocus = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'self'
     * @group Props
     */
    appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>('self');
    /**
     * The motion options.
     * @group Props
     */
    motionOptions = input<MotionOptions | undefined>(undefined);
    /**
     * Whether to use overlay API feature. The properties of overlay API can be used like an object in it.
     * @group Props
     */
    overlayOptions = input<OverlayOptions>();
    /**
     * Callback to invoke when the component receives focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onFocus = output<Event>();
    /**
     * Callback to invoke when the component loses focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onBlur = output<Event>();
    /**
     * Callback to invoke when clear button is clicked.
     * @group Emits
     */
    onClear = output<any>();

    readonly overlayViewChild = viewChild.required<Overlay>('overlay');

    readonly input = viewChild.required<ElementRef>('input');

    /**
     * Custom template of content.
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: Nullable<TemplateRef<void>>;

    /**
     * Custom template of footer.
     * @group Templates
     */
    readonly footerTemplate = contentChild<Nullable<TemplateRef<void>>>('footer', { descendants: false });

    /**
     * Custom template of header.
     * @group Templates
     */
    readonly headerTemplate = contentChild<Nullable<TemplateRef<void>>>('header', { descendants: false });

    /**
     * Custom template of clear icon.
     * @group Templates
     */
    readonly clearIconTemplate = contentChild<Nullable<TemplateRef<void>>>('clearicon', { descendants: false });

    /**
     * Custom template of hide icon.
     * @param {PasswordIconTemplateContext} context - icon context.
     * @see {@link PasswordIconTemplateContext}
     * @group Templates
     */
    @ContentChild('hideicon', { descendants: false }) hideIconTemplate: Nullable<TemplateRef<PasswordIconTemplateContext>>;

    /**
     * Custom template of show icon.
     * @param {PasswordIconTemplateContext} context - icon context.
     * @see {@link PasswordIconTemplateContext}
     * @group Templates
     */
    @ContentChild('showicon', { descendants: false }) showIconTemplate: Nullable<TemplateRef<PasswordIconTemplateContext>>;

    readonly templates = contentChildren(PrimeTemplate);

    $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    _contentTemplate: TemplateRef<void> | undefined;

    _footerTemplate: TemplateRef<void> | undefined;

    _headerTemplate: TemplateRef<void> | undefined;

    _clearIconTemplate: TemplateRef<void> | undefined;

    _hideIconTemplate: TemplateRef<PasswordIconTemplateContext> | undefined;

    _showIconTemplate: TemplateRef<PasswordIconTemplateContext> | undefined;

    overlayVisible: boolean = false;

    meter: Nullable<Meter>;

    infoText: Nullable<string>;

    focused: boolean = false;

    unmasked: boolean = false;

    mediumCheckRegExp!: RegExp;

    strongCheckRegExp!: RegExp;

    resizeListener: VoidListener;

    scrollHandler: Nullable<ConnectedOverlayScrollHandler>;

    value: Nullable<string> = null;

    translationSubscription: Nullable<Subscription>;

    _componentStyle = inject(PasswordStyle);

    overlayService = inject(OverlayService);

    onInit() {
        this.infoText = this.promptText();
        this.mediumCheckRegExp = new RegExp(this.mediumRegex());
        this.strongCheckRegExp = new RegExp(this.strongRegex());
        this.translationSubscription = this.config.translationObserver.subscribe(() => {
            this.updateUI(this.value || '');
        });
    }

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'footer':
                    this._footerTemplate = item.template;
                    break;

                case 'clearicon':
                    this._clearIconTemplate = item.template;
                    break;

                case 'hideicon':
                    this._hideIconTemplate = item.template;
                    break;

                case 'showicon':
                    this._showIconTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    onInput(event: Event) {
        this.value = (event.target as HTMLInputElement).value;
        this.onModelChange(this.value);
    }

    onInputFocus(event: Event) {
        this.focused = true;

        if (this.feedback()) {
            this.overlayVisible = true;
        }

        this.onFocus.emit(event);
    }

    onInputBlur(event: Event) {
        this.focused = false;

        if (this.feedback()) {
            this.overlayVisible = false;
        }

        this.onModelTouched();
        this.onBlur.emit(event);
    }

    onKeyUp(event: KeyboardEvent) {
        if (this.feedback()) {
            let value = (event.target as HTMLInputElement).value;

            this.updateUI(value);

            if (event.code === 'Escape') {
                this.overlayVisible && (this.overlayVisible = false);

                return;
            }

            if (!this.overlayVisible) {
                this.overlayVisible = true;
            }
        }
    }

    updateUI(value: string) {
        let label = null;
        let meter: { strength: string; width: string } | null = null;

        switch (this.testStrength(value)) {
            case 1:
                label = this.weakText();
                meter = {
                    strength: 'weak',
                    width: '33.33%'
                };
                break;

            case 2:
                label = this.mediumText();
                meter = {
                    strength: 'medium',
                    width: '66.66%'
                };
                break;

            case 3:
                label = this.strongText();
                meter = {
                    strength: 'strong',
                    width: '100%'
                };
                break;

            default:
                label = this.promptText();
                meter = null;
                break;
        }

        this.meter = meter;
        this.infoText = label;
    }

    onMaskToggle() {
        this.unmasked = !this.unmasked;
    }

    /** Handles Space on the icon-based mask toggle, preventing page scroll. */
    onMaskToggleSpace(event: Event) {
        event.preventDefault();
        this.onMaskToggle();
    }

    /** Handles Space on the icon-based clear control, preventing page scroll. */
    onClearSpace(event: Event) {
        event.preventDefault();
        this.clear();
    }

    get showIconAriaLabel() {
        return 'Show password';
    }

    get hideIconAriaLabel() {
        return 'Hide password';
    }

    get clearIconAriaLabel() {
        return this.getTranslation(TranslationKeys.CLEAR) || 'Clear';
    }

    onOverlayClick(event: Event) {
        this.overlayService.add({
            originalEvent: event,
            target: this.el.nativeElement
        });
    }

    testStrength(str: string) {
        let level = 0;

        if (this.strongCheckRegExp?.test(str)) level = 3;
        else if (this.mediumCheckRegExp?.test(str)) level = 2;
        else if (str.length) level = 1;

        return level;
    }

    promptText() {
        return this.promptLabel() || this.getTranslation(TranslationKeys.PASSWORD_PROMPT);
    }

    weakText() {
        return this.weakLabel() || this.getTranslation(TranslationKeys.WEAK);
    }

    mediumText() {
        return this.mediumLabel() || this.getTranslation(TranslationKeys.MEDIUM);
    }

    strongText() {
        return this.strongLabel() || this.getTranslation(TranslationKeys.STRONG);
    }

    inputType(unmasked: boolean) {
        return unmasked ? 'text' : 'password';
    }

    getTranslation(option: string) {
        return this.config.getTranslation(option);
    }

    clear() {
        this.value = null;
        this.onModelChange(this.value);
        this.writeValue(this.value);
        this.onClear.emit(undefined);
    }

    /**
     * @override
     *
     * @see {@link BaseEditableHolder.writeControlValue}
     * Writes the value to the control.
     */
    writeControlValue(value: any, setModelValue: (value: any) => void): void {
        if (value === undefined) this.value = null;
        else this.value = value;

        if (this.feedback()) this.updateUI(this.value || '');
        setModelValue(this.value);
        this.cd.markForCheck();
    }

    onDestroy() {
        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }
    }

    get containerDataP() {
        return this.cn({
            fluid: this.hasFluid
        });
    }

    get meterDataP() {
        return this.cn({
            [this.meter?.strength as string]: this.meter?.strength
        });
    }

    get overlayDataP() {
        return this.cn({
            ['overlay-' + this.$appendTo()]: 'overlay-' + this.$appendTo()
        });
    }
}

@NgModule({
    imports: [Password, PasswordDirective, PasswordToggleMaskDirective, PasswordClearDirective, SharedModule, BindModule],
    exports: [PasswordDirective, PasswordToggleMaskDirective, PasswordClearDirective, Password, SharedModule, BindModule]
})
export class PasswordModule {}
