import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, inject, InjectionToken, input, NgModule, TemplateRef, ViewEncapsulation, contentChildren } from '@angular/core';
import { Toolbar as AriaToolbar } from '@angular/aria/toolbar';
import { BlockableUI, PrimeTemplate, SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import { ToolbarStyle } from './style/toolbarstyle';
import { ToolbarPassThrough } from '@wawjs/ngx-prime/types/toolbar';

const TOOLBAR_INSTANCE = new InjectionToken<Toolbar>('TOOLBAR_INSTANCE');

/**
 * Toolbar is a grouping component for buttons and other content.
 * @group Components
 */
@Component({
    selector: 'p-toolbar',
    standalone: true,
    imports: [CommonModule, SharedModule, BindModule],
    template: `
        <ng-content></ng-content>
        @if (startTemplate || _startTemplate) {
            <div [class]="cx('start')" [pBind]="ptm('start')">
                <ng-container *ngTemplateOutlet="startTemplate || _startTemplate"></ng-container>
            </div>
        }
        @if (centerTemplate || _centerTemplate) {
            <div [class]="cx('center')" [pBind]="ptm('center')">
                <ng-container *ngTemplateOutlet="centerTemplate || _centerTemplate"></ng-container>
            </div>
        }
        @if (endTemplate || _endTemplate) {
            <div [class]="cx('end')" [pBind]="ptm('end')">
                <ng-container *ngTemplateOutlet="endTemplate || _endTemplate"></ng-container>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarStyle, { provide: TOOLBAR_INSTANCE, useExisting: Toolbar }, { provide: PARENT_INSTANCE, useExisting: Toolbar }],
    host: {
        '[class]': 'cn(cx("root"), styleClass())',
        '[attr.aria-labelledby]': 'ariaLabelledBy()'
    },
    hostDirectives: [Bind, AriaToolbar]
})
export class Toolbar extends BaseComponent<ToolbarPassThrough> implements BlockableUI {
    componentName = 'Toolbar';

    $pcToolbar: Toolbar | undefined = inject(TOOLBAR_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Defines a string value that labels an interactive element.
     * @group Props
     */
    ariaLabelledBy = input<string>();

    _componentStyle = inject(ToolbarStyle);

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }
    /**
     * Custom start template.
     * @group Templates
     */
    @ContentChild('start', { descendants: false }) startTemplate: TemplateRef<void> | undefined;

    /**
     * Custom end template.
     * @group Templates
     */
    @ContentChild('end', { descendants: false }) endTemplate: TemplateRef<void> | undefined;

    /**
     * Custom center template.
     * @group Templates
     */
    @ContentChild('center', { descendants: false }) centerTemplate: TemplateRef<void> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    _startTemplate: TemplateRef<void> | undefined;

    _endTemplate: TemplateRef<void> | undefined;

    _centerTemplate: TemplateRef<void> | undefined;

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'start':
                case 'left':
                    this._startTemplate = item.template;
                    break;

                case 'end':
                case 'right':
                    this._endTemplate = item.template;
                    break;

                case 'center':
                    this._centerTemplate = item.template;
                    break;
            }
        });
    }
}

@NgModule({
    imports: [Toolbar, SharedModule, BindModule],
    exports: [Toolbar, SharedModule, BindModule]
})
export class ToolbarModule {}
