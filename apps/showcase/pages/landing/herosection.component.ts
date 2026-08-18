import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'hero-section',
    standalone: true,
    imports: [RouterModule],
    template: `
        <section class="landing-hero py-20 px-8 lg:px-20">
            <div class="flex flex-col items-center text-center max-w-4xl mx-auto">
                <h1 class="text-5xl font-bold leading-tight">ngx-prime for <span class="text-primary">Angular</span></h1>
                <p class="mt-6 mb-8 text-surface-500 dark:text-surface-400 font-medium text-xl leading-relaxed">
                    An independent MIT-licensed Angular UI component library, maintained by Web Art Work and contributors and continuing from the PrimeNG v21.1.9 codebase.
                </p>
                <div class="flex items-center gap-4">
                    <a [routerLink]="['/installation']" class="linkbox linkbox-primary"><span>Get started</span><i class="pi pi-arrow-right ms-4"></i></a>
                    <a href="https://github.com/WebArtWork/ngx-prime" target="_blank" rel="noopener noreferrer" class="linkbox"><span>View on GitHub</span><i class="pi pi-github ms-4"></i></a>
                </div>
            </div>
        </section>
    `
})
export class HeroSectionComponent {}
