import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            Avatar does not include any roles by default; the host accepts <i>aria-label</i> or <i>aria-labelledby</i> to describe the component (also passed through to the image when an <i>image</i> is used, as its <i>alt</i> text). The decorative
            icon rendered when using the <i>icon</i> property is hidden from assistive technology with <i>aria-hidden</i> so it isn't announced redundantly. Any other attribute is passed to the root element so a role like <i>img</i> can be added if
            needed. In case avatars need to be tabbable, <i>tabIndex</i> can be added as well to implement custom key handlers.
        </p>

        <h3>Keyboard Support</h3>
        <p>Component does not include any interactive elements.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
