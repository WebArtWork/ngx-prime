import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            BlockUI manages the <i>aria-busy</i> state attribute when the UI gets blocked and unblocked. The mask visually covers the blocked content, but focusable descendants would otherwise remain reachable by keyboard/assistive technology
            underneath it; while blocked, BlockUI marks the other elements in the blocked container (the <i>target</i>'s blockable element, or the rest of the page when no target is set) as <i>inert</i>, and removes it again on unblock/destroy. Any
            valid attribute is passed to the root element so additional attributes like <i>role</i> and <i>aria-live</i> can be used to define live regions.
        </p>

        <h3>Keyboard Support</h3>
        <p>Component does not include any interactive elements.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
