import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';

import {
    IIdentity
} from '../../../../commons/RamAPI2';

@Component({
    selector: 'ram-osp-notifications',
    templateUrl: 'notifications.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent
    ]
})

export class NotificationsComponent extends AbstractPageComponent {

    public idValue: string;
    public canReturnToDashboard: boolean = false;

    public identity: IIdentity;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Software Provider Services');
    }

    public onInit(params: {path: Params, query: Params}) {

        this.idValue = decodeURIComponent(params.path['idValue']);

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // if the user can see more than one business, they can see the dashboard
        this.services.rest.searchDistinctSubjectsForMe(null, 1).subscribe((partyRefs) => {
            this.canReturnToDashboard = partyRefs.totalCount > 1;
        });
    }

    public goToBusinessesPage() {
        this.services.route.goToBusinessesPage();
    }
}
