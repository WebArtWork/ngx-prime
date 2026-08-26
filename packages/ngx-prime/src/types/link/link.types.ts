import type { PassThrough, PassThroughOption } from '@wawjs/ngx-prime/api';

/**
 * Custom pass-through(pt) options.
 * @template I Type of instance.
 *
 * @see {@link Link.pt}
 * @group Interface
 */
export interface LinkPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLAnchorElement, I>;
    /**
     * Used to pass attributes to the icon's DOM element.
     */
    icon?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in Link component.
 * @see {@link LinkPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type LinkPassThrough<I = unknown> = PassThrough<I, LinkPassThroughOptions<I>>;

/**
 * Position of the icon relative to the label.
 * @group Types
 */
export type LinkIconPosition = 'left' | 'right';
