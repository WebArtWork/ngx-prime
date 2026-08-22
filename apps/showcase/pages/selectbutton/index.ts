import { AccessibilityDoc } from '@/doc/selectbutton/accessibility-doc';
import { BasicDoc } from '@/doc/selectbutton/basic-doc';
import { DisabledDoc } from '@/doc/selectbutton/disabled-doc';
import { ImportDoc } from '@/doc/selectbutton/import-doc';
import { InvalidDoc } from '@/doc/selectbutton/invalid-doc';
import { MultipleDoc } from '@/doc/selectbutton/multiple-doc';
import { NativeDoc } from '@/doc/selectbutton/native-doc';
import { ReactiveFormsDoc } from '@/doc/selectbutton/reactiveforms-doc';
import { SizesDoc } from '@/doc/selectbutton/sizes-doc';
import { TemplateDoc } from '@/doc/selectbutton/template-doc';
import { TemplateDrivenFormsDoc } from '@/doc/selectbutton/templatedrivenforms-doc';
import { FluidDoc } from '@/doc/selectbutton/fluid-doc';
import { PTComponent } from '@/doc/selectbutton/pt/PTComponent';
import { AppDoc } from '@/components/doc/app.doc';
import { Component } from '@angular/core';

@Component({
    template: `<app-doc
        docTitle="Angular SelectButton Component"
        header="SelectButton"
        description="Use native pSelectButton directives to choose single or multiple values with buttons. The legacy SelectButton component is deprecated and remains available through v22."
        [docs]="docs"
        [apiDocs]="['SelectButton']"
        [ptDocs]="ptComponent"
        themeDocs="selectbutton"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class SelectButtonDemo {
    ptComponent = PTComponent;

    docs = [
        {
            id: 'import',
            label: 'Import',
            component: ImportDoc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: BasicDoc
        },
        {
            id: 'native',
            label: 'Native Buttons',
            component: NativeDoc
        },
        {
            id: 'multiple',
            label: 'Multiple',
            component: MultipleDoc
        },
        {
            id: 'template',
            label: 'Template',
            component: TemplateDoc
        },
        {
            id: 'sizes',
            label: 'Sizes',
            component: SizesDoc
        },
        {
            id: 'fluid',
            label: 'Fluid',
            component: FluidDoc
        },
        {
            id: 'disabled',
            label: 'Disabled',
            component: DisabledDoc
        },
        {
            id: 'invalid',
            label: 'Invalid',
            component: InvalidDoc
        },
        {
            id: 'forms',
            label: 'Forms',
            children: [
                { id: 'templatedriven', label: 'Template Driven', component: TemplateDrivenFormsDoc },
                { id: 'reactive', label: 'Reactive Forms', component: ReactiveFormsDoc }
            ]
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: AccessibilityDoc
        }
    ];
}
