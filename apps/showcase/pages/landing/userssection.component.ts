import { Component } from '@angular/core';

@Component({
    selector: 'app-users-section',
    standalone: true,
    template: `
        <section class="landing-users py-20 px-4 lg:px-20">
            <div class="section-header">Built on Open Source</div>
            <p class="section-detail">ngx-prime builds on years of open-source work by the PrimeNG team and community.</p>
        </section>
    `
})
export class UsersSectionComponent {}
