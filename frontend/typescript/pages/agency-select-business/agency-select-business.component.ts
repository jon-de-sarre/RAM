import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';

@Component({
    selector: 'agency-select-business',
    templateUrl: 'agency-select-business.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent
    ]
})

export class AgencySelectBusinessComponent extends AbstractPageComponent {

    private dashboard: string;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        this.dashboard = params.path['dashboard'];

        // set banner title
        if (this.dashboard === 'auth') {
            this.setBannerTitle('Authorisations');
        } else {
            this.setBannerTitle('Software Provider Services');
        }

        // todo forms
        // todo search
        // ...

    }

    public search() {
        // todo perform redirect to search (see relationships.component, businesses.component for examples)
    }

    public selectBusiness(idValue: string) {
        if (this.dashboard === 'auth') {
            this.services.route.goToRelationshipsPage(idValue);
        } else {
            this.services.route.goToNotificationsPage(idValue);
        }
    }

}
