import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-footer-section',
    standalone: true,
    imports: [RouterModule],
    template: `
        <section class="landing-footer pt-20 px-8 lg:px-20">
            <div class="landing-footer-container">
                <div class="flex flex-wrap z-10 gap-12">
                    <div>
                        <div class="font-bold mb-4">ngx-prime</div>
                        <p class="text-surface-500 dark:text-surface-400 max-w-sm">An independent MIT-licensed Angular UI component library maintained by Web Art Work and contributors.</p>
                    </div>
                    <div>
                        <div class="font-bold mb-4">Resources</div>
                        <ul class="list-none p-0 m-0">
                            <li class="mb-3"><a [routerLink]="['/installation']" class="text-surface-500 dark:text-surface-400 hover:text-primary">Get started</a></li>
                            <li><a href="https://github.com/WebArtWork/ngx-prime" target="_blank" rel="noopener noreferrer" class="text-surface-500 dark:text-surface-400 hover:text-primary">Source code</a></li>
                        </ul>
                    </div>
                </div>
                <hr class="section-divider" />
                <div class="flex flex-wrap justify-between py-12 gap-8 items-center">
                    <span class="text-2xl font-semibold text-color">ngx-prime</span>
                    <a href="https://github.com/WebArtWork/ngx-prime" target="_blank" rel="noopener noreferrer" class="linkbox linkbox-icon" aria-label="ngx-prime on GitHub"><i class="pi pi-github"></i></a>
                </div>
            </div>
        </section>
    `
})
export class FooterSectionComponent {}
