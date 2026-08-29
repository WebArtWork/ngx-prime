import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: ` <div>
        <app-docsectiontext>
            <div class="doc-section-description">
                <h3>Screen Reader</h3>
                <p>
                    Chart components internally use <i>canvas</i> element, refer to the
                    <a class="text-primary font-medium hover:underline" href="https://www.chartjs.org/docs/latest/general/accessibility.html">Chart.js accessibility</a>
                    guide for more information.
                </p>
                <p>
                    Since a canvas has no text content, the <i>canvas</i> element is given <i>role="img"</i> with <i>aria-label</i>/<i>aria-labelledby</i>, and its <i>aria-describedby</i> points to a visually-hidden data table generated from the
                    <i>data</i> input (labels as row headers, dataset labels as column headers) so screen reader users can read the underlying values instead of only a generic image label.
                </p>
            </div>
        </app-docsectiontext>
        <app-code [hideToggleCode]="true"></app-code>
    </div>`
})
export class AccessibilityDoc {}
