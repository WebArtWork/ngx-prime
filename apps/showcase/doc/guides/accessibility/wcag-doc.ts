import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-wcag-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" alt="WCAG Website">WCAG</a> refers to <strong>Web Content Accessibility Guideline</strong>, a standard managed by the WAI (Web Accessibility Initiative) of W3C (World Wide
                Web Consortium). WCAG consists of recommendations for making the web content more accessible. ngx-prime's implementation target is <strong>WCAG 2.2 Level AA</strong>, combined with
                <strong>EN 301 549</strong> (the harmonised European ICT accessibility standard) and the <strong>WAI-ARIA Authoring Practices Guide</strong> for each component's interaction pattern. See the
                "Conformance" section of this guide for the current status and scope of this target.
            </p>
            <p>
                Various countries around the globe have governmental policies regarding web accessibility as well. Most well known of these are <a href="https://www.section508.gov/manage/laws-and-policies/">Section 508</a> in the US and
                <a href="https://digital-strategy.ec.europa.eu/en/policies/web-accessibility">Web Accessibility Directive</a> of the European Union.
            </p>
        </app-docsectiontext>
    `
})
export class WCAGDoc {}
