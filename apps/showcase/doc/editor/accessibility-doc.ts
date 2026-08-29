import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <div>
        <app-docsectiontext>
            <p>
                Quill performs generally well in terms of accessibility. The elements in the toolbar can be tabbed and have the necessary ARIA roles/attributes for screen readers. One known limitation is the lack of arrow key support for
                <a href="https://github.com/quilljs/quill/issues/1031">dropdowns</a> in the toolbar that may be overcome with a custom toolbar.
            </p>
            <p>
                The editable content area does not have an accessible name by default; use the <i>ariaLabel</i> or <i>ariaLabelledBy</i> properties to describe its purpose for screen reader users.
            </p>
        </app-docsectiontext>
    </div>`
})
export class AccessibilityDoc {}
