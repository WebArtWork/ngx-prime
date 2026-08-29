import { ChangeDetectionStrategy, Component, inject, input, NgModule, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@wawjs/ngx-prime/basecomponent';
import { ButtonGroupStyle } from './style/buttongroupstyle';

@Component({
    selector: 'p-buttonGroup, p-buttongroup, p-button-group',
    standalone: true,
    imports: [],
    template: `
        <span class="p-buttongroup p-component" role="group" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="ariaLabelledBy()">
            <ng-content></ng-content>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ButtonGroupStyle]
})
export class ButtonGroup extends BaseComponent {
    componentName = 'ButtonGroup';

    _componentStyle = inject(ButtonGroupStyle);

    /**
     * Establishes a string value that labels the component.
     * @group Props
     */
    ariaLabel = input<string>();
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    ariaLabelledBy = input<string>();
}

@NgModule({
    imports: [ButtonGroup],
    exports: [ButtonGroup]
})
export class ButtonGroupModule {}
