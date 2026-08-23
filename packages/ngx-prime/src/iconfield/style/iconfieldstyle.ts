import { Injectable } from '@angular/core';
import { style } from '@wawjs/css-prime-styles/iconfield';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const classes = {
    root: ({ instance }) => [
        'p-iconfield',
        {
            'p-iconfield-left': instance.iconPosition() == 'left',
            'p-iconfield-right': instance.iconPosition() == 'right'
        }
    ]
};

@Injectable()
export class IconFieldStyle extends BaseStyle {
    name = 'iconfield';

    style = style;

    classes = classes;
}

/**
 *
 * IconField wraps an input and an icon.
 *
 * [Live Demo](https://www.ngx-prime.org/iconfield/)
 *
 * @module iconfieldstyle
 *
 */
export enum IconFieldClasses {
    /**
     * Class name of the root element
     */
    root = 'p-iconfield'
}
