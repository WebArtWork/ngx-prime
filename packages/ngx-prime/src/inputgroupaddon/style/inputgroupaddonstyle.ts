import { Injectable } from '@angular/core';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const classes = {
    root: 'p-inputgroupaddon'
};

@Injectable()
export class InputGroupAddonStyle extends BaseStyle {
    name = 'inputgroupaddon';

    classes = classes;
}
