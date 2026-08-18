import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    standalone: true,
    template: `
        <div class="layout-footer">
            <div>
                <span>ngx-prime {{ version }} maintained by </span>
                <a href="https://github.com/WebArtWork/ngx-prime" target="_blank" rel="noopener noreferrer">Web Art Work</a>
            </div>
        </div>
    `
})
export class AppFooterComponent {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    version = require('package.json') && require('package.json').version;
}
