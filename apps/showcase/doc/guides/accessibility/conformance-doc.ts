import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-conformance-doc',
    standalone: true,
    imports: [RouterModule, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <h3>Target</h3>
            <p>ngx-prime's accessibility implementation target is:</p>
            <ul>
                <li><strong>WCAG 2.2 Level AA</strong> &ndash; the success-criteria checklist components are implemented and reviewed against.</li>
                <li><strong>EN 301 549</strong> &ndash; the harmonised European ICT accessibility standard. The currently harmonised version is v3.2.1 (incorporating WCAG 2.1 AA); WCAG 2.2 AA is backward-compatible with 2.1 AA, so targeting it satisfies that baseline today and the newer v4.1.0 draft (which incorporates WCAG 2.2 AA directly) if it supersedes v3.2.1.</li>
                <li><strong>WAI-ARIA Authoring Practices Guide (APG)</strong> &ndash; the reference for each composite widget's roles, states, and keyboard interaction pattern.</li>
            </ul>
            <p>
                The <a href="https://eur-lex.europa.eu/eli/dir/2019/882/oj" target="_blank" rel="noopener noreferrer">European Accessibility Act</a> (Directive (EU) 2019/882) and the
                <a href="https://digital-strategy.ec.europa.eu/en/policies/web-accessibility" target="_blank" rel="noopener noreferrer">Web Accessibility Directive</a> (Directive (EU) 2016/2102) are legislation, not technical
                specifications &ndash; ngx-prime aims to help applications satisfy them, rather than implementing them directly.
            </p>

            <h3>Scope and disclaimer</h3>
            <p>
                <strong>ngx-prime does not, by itself, make a consuming application legally compliant with WCAG, EN 301 549, the EAA, or the Web Accessibility Directive.</strong> Final compliance also depends on the consuming
                application's structure, content, configuration, and usage &ndash; for example, images still need meaningful <code>alt</code> text supplied by the application, custom compositions of components still need to be
                assembled correctly, and content authored inside a component (labels, descriptions, templates) is the application's responsibility. ngx-prime aims to support building conformant applications, not to guarantee
                conformance on its own.
            </p>

            <h3>Current status</h3>
            <p>
                An accessibility pass covering roughly 70 components is complete: missing accessible names, incorrect or missing ARIA roles/states/properties, keyboard-operability gaps, and several pre-existing correctness bugs
                (broken <code>aria-describedby</code>/<code>aria-labelledby</code> relationships, missing focus restoration on dialog/overlay close, and similar) have been identified and fixed. A further phase &ndash; migrating
                composite widgets such as tabs, select, menu, listbox, and tree onto Angular's official <code>@angular/aria</code> headless directive package &ndash; is planned but not yet started, pending test coverage this
                library does not currently have. See each component's own "Accessibility" documentation tab for what is and isn't covered for that specific component, and the project's own roadmap for the detailed, up-to-date
                phase-by-phase status.
            </p>

            <h3>Reporting an issue</h3>
            <p>If you find an accessibility issue in a specific component, please open an issue on the project's repository with the component name, the assistive technology/browser combination used, and the expected vs. actual behavior.</p>
        </app-docsectiontext>
    `
})
export class ConformanceDoc {}
