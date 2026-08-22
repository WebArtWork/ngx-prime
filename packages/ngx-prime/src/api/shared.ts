import { CommonModule } from '@angular/common';
import { Component, Directive, NgModule, TemplateRef, inject, input } from '@angular/core';

@Component({
    selector: 'p-header',
    template: '<ng-content></ng-content>'
})
export class Header {}

@Component({
    selector: 'p-footer',
    template: '<ng-content></ng-content>'
})
export class Footer {}

@Directive({
    selector: '[pTemplate]',
    standalone: true
})
export class PrimeTemplate {
    template = inject<TemplateRef<any>>(TemplateRef);

    type = input<string>();

    name = input<string>(undefined, { alias: 'pTemplate' });

    getType(): string {
        return this.name()!;
    }
}

@NgModule({
    imports: [CommonModule, PrimeTemplate, Header, Footer],
    exports: [Header, Footer, PrimeTemplate]
})
export class SharedModule {}
