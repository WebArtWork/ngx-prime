import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, inject, InjectionToken, input, NgModule, numberAttribute, TemplateRef, ViewEncapsulation, contentChild, contentChildren } from '@angular/core';
import { PrimeTemplate, SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import { ProgressBarContentTemplateContext, ProgressBarPassThrough } from '@wawjs/ngx-prime/types/progressbar';
import { ProgressBarStyle } from './style/progressbarstyle';

const PROGRESSBAR_INSTANCE = new InjectionToken<ProgressBar>('PROGRESSBAR_INSTANCE');

/**
 * ProgressBar is a process status indicator.
 * @group Components
 */
@Component({
    selector: 'p-progressBar, p-progressbar, p-progress-bar',
    standalone: true,
    imports: [CommonModule, SharedModule, Bind],
    template: `
        @if (mode() === 'determinate') {
            <div [class]="cn(cx('value'), valueStyleClass())" [pBind]="ptm('value')" [style.width]="value() + '%'" [style.display]="'flex'" [style.background]="color()" [attr.data-p]="dataP">
                <div [class]="cx('label')" [pBind]="ptm('label')" [attr.data-p]="dataP">
                    @if (showValue() && !contentTemplate() && !_contentTemplate) {
                        <div [style.display]="value() != null && value() !== 0 ? 'flex' : 'none'">{{ value() }}{{ unit() }}</div>
                    }
                    <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate; context: { $implicit: value() }"></ng-container>
                </div>
            </div>
        }
        @if (mode() === 'indeterminate') {
            <div [class]="cn(cx('value'), valueStyleClass())" [pBind]="ptm('value')" [style.background]="color()" [attr.data-p]="dataP"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ProgressBarStyle, { provide: PROGRESSBAR_INSTANCE, useExisting: ProgressBar }, { provide: PARENT_INSTANCE, useExisting: ProgressBar }],
    host: {
        role: 'progressbar',
        '[attr.aria-valuemin]': "mode() === 'determinate' ? 0 : null",
        '[attr.aria-valuenow]': "mode() === 'determinate' ? value() : null",
        '[attr.aria-valuemax]': "mode() === 'determinate' ? 100 : null",
        '[attr.aria-valuetext]': "mode() === 'determinate' ? value() + unit() : null",
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-labelledby]': 'ariaLabelledBy()',
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class ProgressBar extends BaseComponent<ProgressBarPassThrough> {
    componentName = 'ProgressBar';

    $pcProgressBar: ProgressBar | undefined = inject(PROGRESSBAR_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    /**
     * Current value of the progress.
     * @group Props
     */
    value = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * Whether to display the progress bar value.
     * @group Props
     */
    showValue = input(true, { transform: booleanAttribute });
    /**
     * Style class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Style class of the value element.
     * @group Props
     */
    valueStyleClass = input<string>();
    /**
     * Unit sign appended to the value.
     * @group Props
     */
    unit = input('%');
    /**
     * Defines the mode of the progress
     * @defaultValue 'determinate'
     * @group Props
     */
    mode = input<'determinate' | 'indeterminate'>('determinate');
    /**
     * Color for the background of the progress.
     * @group Props
     */
    color = input<string>();
    /**
     * Defines a string that labels the component for accessibility.
     * @group Props
     */
    ariaLabel = input<string>();
    /**
     * Specifies one or more IDs in the DOM that labels the component.
     * @group Props
     */
    ariaLabelledBy = input<string>();
    /**
     * Template of the content.
     * @param {ProgressBarContentTemplateContext} context - content context.
     * @see {@link ProgressBarContentTemplateContext}
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<ProgressBarContentTemplateContext>>('content', { descendants: false });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    _componentStyle = inject(ProgressBarStyle);

    readonly templates = contentChildren(PrimeTemplate);

    _contentTemplate: TemplateRef<ProgressBarContentTemplateContext> | undefined;

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;
                default:
                    this._contentTemplate = item.template;
            }
        });
    }

    get dataP() {
        return this.cn({
            determinate: this.mode() === 'determinate',
            indeterminate: this.mode() === 'indeterminate'
        });
    }
}

@NgModule({
    imports: [ProgressBar, SharedModule],
    exports: [ProgressBar, SharedModule]
})
export class ProgressBarModule {}
