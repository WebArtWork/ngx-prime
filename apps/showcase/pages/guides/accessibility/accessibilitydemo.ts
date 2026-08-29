import { AppDoc } from '@/components/doc/app.doc';
import { ColorsDoc } from '@/doc/guides/accessibility/colors-doc';
import { ConformanceDoc } from '@/doc/guides/accessibility/conformance-doc';
import { FormControlsDoc } from '@/doc/guides/accessibility/formcontrols-doc';
import { IntroductionDoc } from '@/doc/guides/accessibility/introduction-doc';
import { SemanticHTMLDoc } from '@/doc/guides/accessibility/semantichtml-doc';
import { WAIARIADoc } from '@/doc/guides/accessibility/waiaria-doc';
import { WCAGDoc } from '@/doc/guides/accessibility/wcag-doc';
import { Component } from '@angular/core';

@Component({
    selector: 'app-accessibility',
    standalone: true,
    imports: [AppDoc],
    template: `<app-doc
        docTitle="Accessibility - ngx-prime"
        header="Accessibility"
        description="ngx-prime targets WCAG 2.2 AA, EN 301 549, and WAI-ARIA APG compliance; see the Conformance section for scope and current status, and each component's own accessibility documentation for details."
        [docs]="docs"
        docType="page"
    ></app-doc>`
})
export class AccessibilityDemoComponent {
    docs = [
        {
            id: 'introduction',
            label: 'Introduction',
            component: IntroductionDoc
        },
        {
            id: 'wcag',
            label: 'WCAG',
            component: WCAGDoc
        },
        {
            id: 'conformance',
            label: 'Conformance',
            component: ConformanceDoc
        },
        {
            id: 'form-controls',
            label: 'Form Controls',
            component: FormControlsDoc
        },
        {
            id: 'semantic-html',
            label: 'Semantic HTML',
            component: SemanticHTMLDoc
        },
        {
            id: 'wai-aria',
            label: 'WAI-ARIA',
            component: WAIARIADoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: ColorsDoc
        }
    ];
}
