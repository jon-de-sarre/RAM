import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {RAMServices} from '../../services/ram-services';

@Component({
    selector: 'ram-access-denied',
    templateUrl: 'access-denied.component.html',
    directives: [
        ROUTER_DIRECTIVES
    ]
})

export class AccessDeniedComponent extends AbstractPageComponent {

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Relationship Authorisation Manager');
    }

}
