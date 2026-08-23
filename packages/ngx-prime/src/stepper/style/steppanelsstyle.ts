import { Injectable } from '@angular/core';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const classes = {
    root: 'p-steppanels'
};

@Injectable()
export class StepPanelsStyle extends BaseStyle {
    name = 'steppanel';

    classes = classes;
}

/**
 *
 * StepPanel is a helper component for Stepper component.
 *
 * [Live Demo](https://www.ngx-prime.org/stepper/)
 *
 * @module steppanelsstyle
 *
 */
export enum StepPanelsClasses {
    /**
     * Class name of the root element
     */
    root = 'p-steppanels'
}
