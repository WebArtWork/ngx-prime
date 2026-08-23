import { Injectable } from '@angular/core';
import { style as ripple_style } from '@wawjs/css-prime-styles/ripple';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const style = /*css*/ `
    ${ripple_style}

    /* For ngx-prime */
    .p-ripple {
        overflow: hidden;
        position: relative;
    }

    .p-ripple-disabled .p-ink {
        display: none !important;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`;

const classes = {
    root: 'p-ink'
};

@Injectable()
export class RippleStyle extends BaseStyle {
    name = 'ripple';

    style = style;

    classes = classes;
}

/**
 *
 * Ripple directive adds ripple effect to the host element.
 *
 * [Live Demo](https://www.ngx-prime.org/ripple)
 *
 * @module ripplestyle
 *
 */

export enum RippleClasses {
    /**
     * Class name of the root element
     */
    root = 'p-ink'
}
