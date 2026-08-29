import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';
import { Component } from '@angular/core';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: ` <div>
        <app-docsectiontext>
            <h3>Screen Reader</h3>
            <p>
                ProgressBar components uses <i>progressbar</i> role along with <i>aria-valuemin</i>, <i>aria-valuemax</i>, <i>aria-valuenow</i> and <i>aria-valuetext</i> attributes. In <i>indeterminate</i> mode these value attributes are omitted per
                the WAI-ARIA progressbar pattern, since no bounded value is available. Value to describe the component can be defined using the <i>ariaLabelledBy</i> and <i>ariaLabel</i> props.
            </p>
        </app-docsectiontext>

        <app-code [code]="code" [hideToggleCode]="true"></app-code>

        <h3>Keyboard Support</h3>
        <p>Not applicable.</p>
    </div>`
})
export class AccessibilityDoc {
    code: Code = {
        html: `<span id="label_status">Status</span>
<p-progressbar aria-labelledby="label_status" />

<p-progressbar aria-label="Status" />`
    };
}
