import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <div>
        <app-docsectiontext>
            <h3>Screen Reader</h3>
            <p>
                By default Skeleton uses <i>aria-hidden</i> as "true" so that it gets ignored by screen readers, any valid attribute is passed to the root element so you may customize it further if required. If multiple skeletons are grouped inside a
                container, you may use <i>aria-busy</i> on the container element as well to indicate the loading process.
            </p>
            <p>
                Alternatively, setting the <i>ariaLabel</i> prop (e.g. "Loading content") exposes the skeleton itself as a busy <i>progressbar</i> (<i>role="progressbar"</i>, <i>aria-busy="true"</i>) with that accessible name instead of hiding it,
                which is useful when there is no separate loading announcement elsewhere on the page.
            </p>
        </app-docsectiontext>

        <h3>Keyboard Support</h3>
        <p>Component does not include any interactive elements.</p>
    </div>`
})
export class AccessibilityDoc {}
