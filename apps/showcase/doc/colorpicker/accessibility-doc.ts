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
                Specification does not cover a color picker <a href="https://github.com/w3c/aria/issues/930">yet</a>, so this component approximates one with the <i>slider</i> pattern: the saturation/brightness area and the hue track both expose
                <i>role="slider"</i> with <i>aria-valuemin</i>/<i>aria-valuemax</i>/<i>aria-valuenow</i> (and <i>aria-valuetext</i> for the 2D saturation/brightness area), are keyboard-focusable, and can be adjusted with the arrow keys as a
                non-pointer alternative to dragging. Screen reader support is still an approximation since a real 2D slider has no dedicated ARIA pattern; prefer the native <i>&lt;input type="color"&gt;</i> element for new code. This component is
                deprecated and scheduled for removal in v23.
            </p>
        </app-docsectiontext>

        <h3>Closed State Keyboard Support of Popup ColorPicker</h3>
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
                        <td>Moves focus to the color picker button.</td>
                    </tr>
                    <tr>
                        <td>
                            <i>space</i>
                        </td>
                        <td>Opens the popup and moves focus to the color slider.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3>Popup Keyboard Support</h3>
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
                            <i>escape</i>
                        </td>
                        <td>Closes the popup and moves focus back to the trigger input.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3>Color Picker Slider</h3>
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
                            <i>arrow keys</i>
                        </td>
                        <td>Adjusts saturation (left/right) and brightness (up/down). Hold <i>shift</i> for larger steps.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3>Hue Slider</h3>
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
                            <span class="inline-flex flex-col">
                                <i class="mb-1">up/right arrow</i>
                                <i>down/left arrow</i>
                            </span>
                        </td>
                        <td>Changes hue. Hold <i>shift</i> for larger steps.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`
})
export class AccessibilityDoc {}
