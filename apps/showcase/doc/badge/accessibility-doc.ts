import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            Badge does not include any roles by default; the <i>p-badge</i> component and the <i>pBadge</i> directive both accept an <i>aria-label</i> or <i>aria-labelledby</i> to describe the component. This is particularly useful for "dot" badges
            (no <i>value</i>) or ones that only convey meaning through <i>severity</i> color, since those otherwise have no accessible name. Any other attribute is passed to the root element so additional aria roles/attributes can be added if
            required. If the badges are dynamic, <i>aria-live</i> may be utilized as well. In case badges need to be tabbable, <i>tabIndex</i> can be added to implement custom key handlers.
        </p>

        <h3>Keyboard Support</h3>
        <p>Component does not include any interactive elements.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
