import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';

import {
    IIdentity
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-osp-notification-add',
    templateUrl: 'add-notification.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent
    ]
})

export class AddNotificationComponent extends AbstractPageComponent {

    public idValue: string;

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

    }

    public back() {
        this.services.route.goToNotificationsPage(this.idValue);
    }

    // todo to be implemented
    public save() {
        this.clearGlobalMessages();
        alert('TODO: Not yet implemented');
    }

}
