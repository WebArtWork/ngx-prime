import { Service } from '@angular/core';
import { Subject } from 'rxjs';

@Service()
export class OverlayService {
    private clickSource = new Subject<any>();

    private parentDragSource = new Subject<Element>();

    clickObservable = this.clickSource.asObservable();

    parentDragObservable = this.parentDragSource.asObservable();

    add(event: any) {
        if (event) {
            this.clickSource.next(event);
        }
    }

    emitParentDrag(container: Element) {
        this.parentDragSource.next(container);
    }
}
