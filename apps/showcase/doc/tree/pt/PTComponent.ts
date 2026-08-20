import { Component } from '@angular/core';
import { PTViewer } from './PTViewer';

@Component({
    standalone: true,
    imports: [PTViewer],
    template: ` <app-tree-pt-viewer /> `
})
export class PTComponent {}
