import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {RAMServices} from '../../services/ram-services';

@Component({
    selector: 'ram-not-found',
    templateUrl: 'not-found.component.html',
    directives: [
        ROUTER_DIRECTIVES
    ]
})

export class NotFoundComponent extends AbstractPageComponent {

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Relationship Authorisation Manager');
    }

}
