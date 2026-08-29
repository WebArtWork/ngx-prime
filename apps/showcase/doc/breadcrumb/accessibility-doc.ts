import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            Breadcrumb uses the <i>nav</i> element with a default <i>aria-label</i> of "Breadcrumb" per the WAI-ARIA breadcrumb pattern; since any attribute is passed to the root implicitly, a custom <i>aria-labelledby</i> or <i>aria-label</i> can
            override it. Inside, an ordered list is used where the list item separators and the home icon have <i>aria-hidden</i> so they're ignored by screen readers. The last link, which represents the current route, gets <i>aria-current="page"</i>.
        </p>

        <h3>Keyboard Support</h3>
        <p>No special keyboard interaction is needed, all menuitems are focusable based on the page tab sequence.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
