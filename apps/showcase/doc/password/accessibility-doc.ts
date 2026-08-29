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
                Value to describe the component can either be provided via <i>label</i> tag combined with <i>id</i> prop or using <i>ariaLabelledBy</i>, <i>ariaLabel</i> props. Screen reader is notified about the changes to the strength of the
                password using a section that has <i>role="status"</i> and <i>aria-live="polite"</i> while typing. The built-in show/hide and clear icons expose <i>role="button"</i>, a fixed accessible name ("Show password" / "Hide password" /
                "Clear"), and are reachable and operable from the keyboard (Enter and Space), not only by pointer.
            </p>
        </app-docsectiontext>

        <app-code [code]="code" [hideToggleCode]="true" [hideCodeSandbox]="true" [hideStackBlitz]="true"></app-code>

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
                        <td>
                            <i>tab</i>
                        </td>
                        <td>Moves focus to the input, then to the visibility toggle and clear icon when present.</td>
                    </tr>
                    <tr>
                        <td>
                            <i>enter</i> / <i>space</i>
                        </td>
                        <td>Activates the focused visibility toggle or clear icon.</td>
                    </tr>
                    <tr>
                        <td>
                            <i>escape</i>
                        </td>
                        <td>Hides the strength meter if open.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`
})
export class AccessibilityDoc {
    code: Code = {
        html: `<label for="pwd1">Password</label>
<p-password inputId="pwd1" />

<span id="pwd2">Password</span>
<p-password ariaLabelledBy="pwd2" />

<p-password ariaLabel="Password" />`
    };
}
