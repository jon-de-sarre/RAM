import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {RAMServices} from '../../commons/ram-services';

@Component({
    selector: 'ram-four-o-four',
    templateUrl: 'four-o-four.component.html',
    directives: [
        ROUTER_DIRECTIVES
    ]
})

export class NotFoundComponent extends AbstractPageComponent {

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Not Found');
    }

}
