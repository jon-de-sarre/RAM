import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {RAMServices} from '../../commons/ram-services';

@Component({
    selector: 'landing-home',
    templateUrl: 'welcome-home.component.html',
    directives: [ROUTER_DIRECTIVES]
})

export class WelcomeHomeComponent extends AbstractPageComponent {

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Relationship Access Manager');
    }

    public onInit(params: {path: Params, query: Params}) {

        // logged in identity
        this.rest.findMyIdentity().subscribe(identity => {
            const idValue = identity.idValue;
            this.routeHelper.goToRelationshipsPage(idValue);
        });

    }

}