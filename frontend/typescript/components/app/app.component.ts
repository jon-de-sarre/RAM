import 'ng2-bootstrap';
import {Component} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {RAMServices} from '../../commons/ram-services';
import {RAMRestService} from '../../services/ram-rest.service';
import {RAMModelHelper} from '../../commons/ram-model-helper';
import {RAMRouteHelper} from '../../commons/ram-route-helper';
import {RAMNavService} from '../../services/ram-nav.service';
import {RAMConstantsService} from '../../services/ram-constants.service';

import {BannerComponent} from '../commons/banner/banner.component';
import {BannerService} from '../commons/banner/banner.service';
import {ErrorComponent} from '../commons/error/error.component';
import {ErrorService} from '../commons/error/error.service';

@Component({
    selector: 'ram-app',
    templateUrl: 'app.component.html',
    directives: [ROUTER_DIRECTIVES, ErrorComponent, BannerComponent],
    providers: [
        HTTP_PROVIDERS,
        RAMServices,
        RAMRestService,
        RAMModelHelper,
        RAMRouteHelper,
        RAMNavService,
        RAMConstantsService,
        BannerService,
        ErrorService
    ]
})

export class AppComponent {
}