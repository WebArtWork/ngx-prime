import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            The underlying markup still uses nested <i>table</i> elements for layout, but every <i>table</i>/<i>tbody</i>/<i>tr</i>/<i>td</i> used purely for layout now carries <i>role="presentation"</i> so screen readers no longer announce spurious
            data-table semantics (rows/columns) for what is a diagram, not tabular data. The chart root exposes <i>role="tree"</i> (with an accessible name via <i>ariaLabel</i>/<i>ariaLabelledBy</i>, and <i>aria-multiselectable</i> when
            <i>selectionMode</i> is <i>"multiple"</i>), each node exposes <i>role="treeitem"</i> with <i>aria-selected</i> (when selectable) and <i>aria-expanded</i> (when collapsible), and each expand/collapse toggle exposes <i>aria-expanded</i> and
            an <i>aria-label</i> ("Expand"/"Collapse"). A full nested-list (<i>ul</i>/<i>li</i>) rewrite remains a longer-term option, but is no longer required for correct tree semantics.
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
                        <td>Moves focus through the focusable elements within the chart, including selectable nodes and expand/collapse toggles.</td>
                    </tr>
                    <tr>
                        <td><i>enter</i></td>
                        <td>Toggles the expanded state of a node, or selects a focused node when <i>selectionMode</i> is set.</td>
                    </tr>
                    <tr>
                        <td><i>space</i></td>
                        <td>Toggles the expanded state of a node, or selects a focused node when <i>selectionMode</i> is set.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
