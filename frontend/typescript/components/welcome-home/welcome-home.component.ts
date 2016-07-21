import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {BannerService} from '../commons/banner/banner.service';
import {RAMRestService} from '../../services/ram-rest.service';
import {RAMModelHelper} from '../../commons/ram-model-helper';
import {RAMRouteHelper} from '../../commons/ram-route-helper';

@Component({
    selector: 'landing-home',
    templateUrl: 'welcome-home.component.html',
    directives: [ROUTER_DIRECTIVES]
})

export class WelcomeHomeComponent extends AbstractPageComponent {

    constructor(route: ActivatedRoute,
                router: Router,
                rest: RAMRestService,
                modelHelper: RAMModelHelper,
                routeHelper: RAMRouteHelper,
                bannerService: BannerService) {
        super(route, router, rest, modelHelper, routeHelper, bannerService);
        this.setTitle('Relationship Access Manager');
    }

    public onInit(params: {path: Params, query: Params}) {

        // logged in identity
        this.rest.findMyIdentity().subscribe(identity => {
            const idValue = identity.idValue;
            this.routeHelper.goToRelationshipsPage(idValue);
        });

    }

}