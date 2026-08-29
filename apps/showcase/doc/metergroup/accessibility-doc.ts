import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <h3>Screen Reader</h3>
            <p>
                MeterGroup component uses <i>meter</i> role in addition to the <i>aria-valuemin</i>, <i>aria-valuemax</i>, <i>aria-valuenow</i> and <i>aria-valuetext</i> attributes. Value to describe the component can be defined using the
                <i>ariaLabel</i> or <i>ariaLabelledBy</i> props.
            </p>

            <h3>Keyboard Support</h3>
            <p>Component does not include any interactive elements.</p>
        </app-docsectiontext>
    `
})
export class AccessibilityDoc {}
