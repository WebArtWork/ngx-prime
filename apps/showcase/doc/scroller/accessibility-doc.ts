import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            VirtualScroller renders its items in a plain container element, no specific role is enforced by default, still you may use any aria role and attributes as any valid attribute is passed to the container element (e.g.
            <i>role="list"</i> with <i>role="listitem"</i> on the item template when the content represents a list).
        </p>
        <h4>Keyboard Support</h4>
        <p>The scrollable container element has a <i>tabindex</i> (defaults to 0) so it can be reached and scrolled with the keyboard even when it has no interactive descendants.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
