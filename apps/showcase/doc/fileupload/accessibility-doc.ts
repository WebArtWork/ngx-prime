import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText, RouterModule],
    template: `
        <app-docsectiontext>
            <h3>Screen Reader</h3>
            <p>FileUpload uses a hidden native <i>input</i> element with <i>type="file"</i> for screen readers.</p>
            <p>
                Validation messages, upload progress and the selected-file summary are placed in a <i>role="status"</i> / <i>aria-live="polite"</i> region so they are announced automatically as they change, without requiring the user to move
                focus. Drag-and-drop is always paired with the keyboard-operable Choose button as a non-drag alternative for selecting files.
            </p>
            <h3>Keyboard Support</h3>
            <p>Interactive elements of the uploader are buttons, visit the <a routerLink="/button#accessibility">Button</a> accessibility section for more information.</p>
        </app-docsectiontext>
    `
})
export class AccessibilityDoc {}
