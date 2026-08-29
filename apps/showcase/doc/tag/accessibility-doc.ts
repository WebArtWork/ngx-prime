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
                Tag does not include any roles and attributes by default, any attribute is passed to the root element so aria roles and attributes can be added if required. The tag's optional icon is decorative and hidden from assistive technology
                with <i>aria-hidden</i>, since the visible <i>value</i> text is always rendered alongside it. If the tags are dynamic,<i>aria-live</i> may be utilized as well. In case tags need to be tabbable, <i>tabIndex</i> can be added to implement
                custom key handlers.
            </p>

            <h3>Keyboard Support</h3>
            <p>Component does not include any interactive elements.</p>
        </app-docsectiontext>
    </div>`
})
export class AccessibilityDoc {}
