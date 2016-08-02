import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';
import { BusinessSelectComponent } from '../../components/business-select/business-select.component';
import {ABRentry} from '../../../../commons/abr';
import {RAMRestService} from '../../services/ram-rest.service';

@Component({
    selector: 'agency-select-business',
    templateUrl: 'agency-select-business.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent,
        BusinessSelectComponent
    ]
})

export class AgencySelectBusinessComponent extends AbstractPageComponent {

    private dashboard: string;

    public business:ABRentry = null;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices,
                private rest: RAMRestService) {
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
    }

    public selectBusiness(business: ABRentry) {
        this.business = business;
    }

    public acceptBusiness() {
        this.rest.registerABRCompany(this.business).subscribe((data) => {
            this.whereToNext(data.idValue);
        },(err:any) => {
            this.displayErrors(this.rest.extractErrorMessages(err));
        });
    }

    public whereToNext(id:string) {
        if (this.dashboard === 'auth') {
            this.services.route.goToRelationshipsPage(id);
        } else {
            this.services.route.goToNotificationsPage(id);
        }
    }

    public displayErrors(errors:string[]) {
        alert(errors.join('\n'));
    }
}
