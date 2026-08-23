import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ContentChild, inject, InjectionToken, input, NgModule, output, TemplateRef, ViewEncapsulation, contentChildren } from '@angular/core';
import { PrimeTemplate, SharedModule, TranslationKeys } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import { TimesCircleIcon } from '@wawjs/ngx-prime/icons';
import { ChipProps, ChipPassThrough } from '@wawjs/ngx-prime/types/chip';
import { ChipStyle } from './style/chipstyle';

const CHIP_INSTANCE = new InjectionToken<Chip>('CHIP_INSTANCE');

/**
 * Chip represents people using icons, labels and images.
 * @group Components
 */
@Component({
    selector: 'p-chip',
    standalone: true,
    imports: [CommonModule, TimesCircleIcon, SharedModule, Bind],
    template: `
        <ng-content></ng-content>
        @if (resolvedImage()) {
            <img [pBind]="ptm('image')" [class]="cx('image')" [src]="resolvedImage()" (error)="imageError($event)" [alt]="resolvedAlt()" />
        } @else {
            @if (resolvedIcon()) {
                <span [pBind]="ptm('icon')" [class]="resolvedIcon()" [ngClass]="cx('icon')"></span>
            }
        }
        @if (resolvedLabel()) {
            <div [pBind]="ptm('label')" [class]="cx('label')">{{ resolvedLabel() }}</div>
        }
        @if (resolvedRemovable()) {
            @if (!removeIconTemplate && !_removeIconTemplate) {
                @if (resolvedRemoveIcon()) {
                    <span
                        [pBind]="ptm('removeIcon')"
                        [class]="resolvedRemoveIcon()"
                        [ngClass]="cx('removeIcon')"
                        (click)="close($event)"
                        (keydown)="onKeydown($event)"
                        [attr.tabindex]="disabled() ? -1 : 0"
                        [attr.aria-label]="removeAriaLabel"
                        role="button"
                    ></span>
                }
                @if (!resolvedRemoveIcon()) {
                    <svg
                        [pBind]="ptm('removeIcon')"
                        data-p-icon="times-circle"
                        [class]="cx('removeIcon')"
                        (click)="close($event)"
                        (keydown)="onKeydown($event)"
                        [attr.tabindex]="disabled() ? -1 : 0"
                        [attr.aria-label]="removeAriaLabel"
                        role="button"
                    />
                }
            }
            @if (removeIconTemplate || _removeIconTemplate) {
                <span [pBind]="ptm('removeIcon')" [attr.tabindex]="disabled() ? -1 : 0" [class]="cx('removeIcon')" (click)="close($event)" (keydown)="onKeydown($event)" [attr.aria-label]="removeAriaLabel" role="button">
                    <ng-template *ngTemplateOutlet="removeIconTemplate || _removeIconTemplate"></ng-template>
                </span>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ChipStyle, { provide: CHIP_INSTANCE, useExisting: Chip }, { provide: PARENT_INSTANCE, useExisting: Chip }],
    host: {
        '[class]': "cn(cx('root'), resolvedStyleClass())",
        '[style]': "sx('root')",
        '[attr.aria-label]': 'resolvedLabel()',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Chip extends BaseComponent<ChipPassThrough> {
    componentName = 'Chip';

    $pcChip: Chip | undefined = inject(CHIP_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * Defines the text to display.
     * @group Props
     */
    label = input<string>();
    /**
     * Defines the icon to display.
     * @group Props
     */
    icon = input<string>();
    /**
     * Defines the image to display.
     * @group Props
     */
    image = input<string>();
    /**
     * Alt attribute of the image.
     * @group Props
     */
    alt = input<string>();
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * When present, it specifies that the element should be disabled.
     * @group Props
     */
    disabled = input(false, { transform: booleanAttribute });
    /**
     * Whether to display a remove icon.
     * @group Props
     */
    removable = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Icon of the remove element.
     * @group Props
     */
    removeIcon = input<string>();
    /**
     * Callback to invoke when a chip is removed.
     * @param {MouseEvent} event - Mouse event.
     * @group Emits
     */
    onRemove = output<MouseEvent>();
    /**
     * This event is triggered if an error occurs while loading an image file.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onImageError = output<Event>();

    visible: boolean = true;

    get removeAriaLabel() {
        return this.config.getTranslation(TranslationKeys.ARIA)['removeLabel'];
    }
    /**
     * Used to pass all properties of the chipProps to the Chip component.
     * @group Props
     */
    chipProps = input<ChipProps>();

    readonly resolvedLabel = computed(() => this.chipProps()?.label ?? this.label());

    readonly resolvedIcon = computed(() => this.chipProps()?.icon ?? this.icon());

    readonly resolvedImage = computed(() => this.chipProps()?.image ?? this.image());

    readonly resolvedAlt = computed(() => this.chipProps()?.alt ?? this.alt());

    readonly resolvedStyleClass = computed(() => this.chipProps()?.styleClass ?? this.styleClass());

    readonly resolvedRemovable = computed(() => this.chipProps()?.removable ?? this.removable());

    readonly resolvedRemoveIcon = computed(() => this.chipProps()?.removeIcon ?? this.removeIcon());

    _componentStyle = inject(ChipStyle);

    /**
     * Custom remove icon template.
     * @group Templates
     */
    @ContentChild('removeicon', { descendants: false }) removeIconTemplate: TemplateRef<void> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    _removeIconTemplate: TemplateRef<void> | undefined;

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'removeicon':
                    this._removeIconTemplate = item.template;
                    break;

                default:
                    this._removeIconTemplate = item.template;
                    break;
            }
        });
    }

    close(event: MouseEvent) {
        this.visible = false;
        this.onRemove.emit(event);
    }

    onKeydown(event) {
        if (event.key === 'Enter' || event.key === 'Backspace') {
            this.close(event);
        }
    }

    imageError(event: Event) {
        this.onImageError.emit(event);
    }

    get dataP() {
        return this.cn({
            removable: this.resolvedRemovable()
        });
    }
}

@NgModule({
    imports: [Chip, SharedModule],
    exports: [Chip, SharedModule]
})
export class ChipModule {}
