import 'ng2-bootstrap';
import {Component} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {RAMServices} from '../services/ram-services';
import {RAMRestService} from '../services/ram-rest.service';
import {RAMModelService} from '../services/ram-model.service';
import {RAMRouteService} from '../services/ram-route.service';
import {RAMNavService} from '../services/ram-nav.service';
import {RAMConstantsService} from '../services/ram-constants.service';

import {BannerComponent} from '../components/banner/banner.component';
import {BannerService} from '../components/banner/banner.service';
import {ErrorComponent} from '../components/error/error.component';
import {ErrorService} from '../components/error/error.service';

@Component({
    selector: 'ram-app',
    templateUrl: 'app.component.html',
    directives: [ROUTER_DIRECTIVES, ErrorComponent, BannerComponent],
    providers: [
        HTTP_PROVIDERS,
        RAMServices,
        RAMRestService,
        RAMModelService,
        RAMRouteService,
        RAMNavService,
        RAMConstantsService,
        BannerService,
        ErrorService
    ]
})

export class AppComponent {
}