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
                Terminal component has an input element that can be described with the <i>ariaLabel</i> or <i>ariaLabelledBy</i> properties, which are applied directly to the command input element (not the root element). The element that lists the
                previous commands has <i>aria-live</i> so that changes are received by the screen reader.
            </p>

            <h3>Keyboard Support</h3>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Function</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i>tab</i></td>
                            <td>Moves focus through the input element.</td>
                        </tr>
                        <tr>
                            <td><i>enter</i></td>
                            <td>Executes the command when focus in on the input element.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
    </div>`
})
export class AccessibilityDoc {}
