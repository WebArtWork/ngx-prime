import { Component } from '@angular/core';

import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-limitations-doc',
    standalone: true,
    imports: [AppDocSectionText, RouterModule],
    template: `<app-docsectiontext>
        <p>Current known technical limitations are listed at this section.</p>
        <ul class="leading-relaxed list-inside list-disc">
            <li>The border width token in Figma does not support multiple values, related <a href="https://github.com/tokens-studio/figma-plugin/issues/3237" target="_blank" rel="noopener noreferrer" class="doc-link">issue</a>.</li>
        </ul>
    </app-docsectiontext>`
})
export class LimitationsDoc {}
