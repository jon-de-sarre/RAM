import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {RAMServices} from '../../services/ram-services';

import {IIdentity} from '../../../../commons/RamAPI2';

@Component({
    selector: 'landing-home',
    templateUrl: 'welcome-home.component.html',
    directives: [ROUTER_DIRECTIVES]
})

export class WelcomeHomeComponent extends AbstractPageComponent {

    private identity: IIdentity = null;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Relationship Access Manager');
    }

    public onInit(params: {path: Params, query: Params}) {

        const dashboard = params.path['dashboard'];

        // logged in identity
        this.services.rest.findMyIdentity().subscribe(identity => {

            this.identity = identity;

            if (dashboard === 'auth') {
                this.goToAuthorisationsPage();
            } else if (dashboard === 'sps') {
                this.goToSoftwareProviderServicesPage();
            }

        });

    }

    public goToAuthorisationsPage() {
        if (this.isAuthenticated()) {
            if (this.isAgencyUser()) {
                this.services.route.goToAgencySelectBusinessForAuthorisationsPage();
            } else {
                this.services.route.goToRelationshipsPage(this.identity.idValue);
            }
        } else {
            this.clearGlobalMessages();
            this.addGlobalMessage('You are not currently logged in.');
        }
    }

    public goToSoftwareProviderServicesPage() {
        if (this.isAuthenticated()) {
            if (this.isAgencyUser()) {
                this.services.route.goToAgencySelectBusinessForSoftwareProviderServicesPage();
            } else {
                this.services.route.goToBusinessesPage();
            }
        } else {
            this.clearGlobalMessages();
            this.addGlobalMessage('You are not currently logged in.');
        }
    }

    private isAuthenticated() {
        return this.identity !== null;
    }

    // todo handle agency (ie consider using Principal)
    // todo determine if agency user or not
    private isAgencyUser() {
        return false;
    }

}