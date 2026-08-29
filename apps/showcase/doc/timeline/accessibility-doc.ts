import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            Timeline's root element carries <i>role="list"</i> and each event <i>role="listitem"</i>, so assistive technology announces the events as a sequence even though the underlying markup is a set of <i>div</i> elements (needed for the
            horizontal/vertical/alignment layouts). Provide an accessible name for the whole timeline via the <i>ariaLabel</i> or <i>ariaLabelledBy</i> prop; any other valid ARIA attribute can still be passed through, as with any host element.
        </p>
        <h3>Keyboard Support</h3>
        <p>Component does not include any interactive elements.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
