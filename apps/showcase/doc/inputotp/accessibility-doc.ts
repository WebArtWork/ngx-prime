import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [RouterModule, AppDocSectionText],
    template: ` <div>
        <app-docsectiontext>
            <h3>Screen Reader</h3>
            <p>
                Input OTP uses a set of InputText components, refer to the <a routerLink="/inputtext">InputText</a> component for more information about the screen reader support. The
                container carries <i>role="group"</i> with an accessible name (<i>aria-label</i>, overridable via the <i>ariaLabel</i> prop, or <i>aria-labelledby</i> via
                <i>ariaLabelledBy</i>) so assistive technology announces the fields as one logical control. Each individual digit input additionally exposes its own
                <i>aria-label</i> (e.g. "One-time code, digit 2 of 4") and <i>aria-invalid</i> reflecting the <i>invalid</i> prop. Every digit input sets
                <i>autocomplete="one-time-code"</i> (per WCAG 2.2 Accessible Authentication / SC 3.3.8) so browsers and password managers can offer one-time-code autofill across the
                split fields; this is disabled automatically when <i>mask</i> is enabled, since masked/password-type inputs should not participate in autofill.
            </p>
        </app-docsectiontext>

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
                        <td>Moves focus to the input otp.</td>
                    </tr>
                    <tr>
                        <td><i>right arrow</i></td>
                        <td>Moves focus to the next input element.</td>
                    </tr>
                    <tr>
                        <td><i>left arrow</i></td>
                        <td>Moves focus to the previous input element.</td>
                    </tr>
                    <tr>
                        <td><i>backspace</i></td>
                        <td>Deletes the input and moves focus to the previous input element.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`
})
export class AccessibilityDoc {}
