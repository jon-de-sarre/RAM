import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {RAMServices} from '../../services/ram-services';

@Component({
    selector: 'ram-business-relationships',
    templateUrl: 'businesses.component.html',
    directives: [
        ROUTER_DIRECTIVES
    ]
})

export class BusinessesComponent extends AbstractPageComponent {

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Software Provider Services');
    }

}
