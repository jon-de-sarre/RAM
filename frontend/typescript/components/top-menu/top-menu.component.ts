import 'ng2-bootstrap';
import {Component} from '@angular/core';

import {RAMServices} from '../../services/ram-services';

import {IIdentity} from '../../../../commons/RamAPI2';

@Component({
    selector: 'top-menu',
    templateUrl: 'top-menu.component.html'
})

export class TopMenuComponent {

    public me: IIdentity;

    constructor(private services: RAMServices) {
    }

    public ngOnInit() {
        this.services.rest.findMyIdentity().subscribe(
            identity => {
                this.me = identity;
            }
        );
    }

    public isLoggedIn() {
        return this.me !== null && this.me !== undefined;
    }

    public goToHomePage() {
        this.services.route.goToHomePage();
    }

    public goToAuthorisationsHomePage() {
        this.services.route.goToAuthorisationsHomePage();
    }

    public goToSoftwareProviderServicesPage() {
        this.services.route.goToSoftwareServicesProviderHomePage();
    }

}