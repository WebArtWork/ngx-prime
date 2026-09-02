import { AppComponent } from '@/components/layout/app.component';
import { config } from '@/server/app.config.server';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { resetUniqueComponentId, ZIndexUtils } from '@wawjs/ngx-prime/utils';

const bootstrap = (context: BootstrapContext) => {
    // Angular's static site generator renders every page sequentially within
    // the same worker process, so module-scoped singleton state (unique id
    // counters, the z-index stack) isn't reset between pages by default and
    // can leak stale state from one page's render into the next. Reset it
    // explicitly before each render.
    resetUniqueComponentId();
    ZIndexUtils.reset();

    return bootstrapApplication(AppComponent, config, context);
};

export default bootstrap;
