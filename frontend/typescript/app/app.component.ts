import 'ng2-bootstrap';
import {Component} from '@angular/core';
import {HTTP_PROVIDERS} from '@angular/http';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {RAMServices} from '../services/ram-services';
import {RAMRestService} from '../services/ram-rest.service';
import {RAMModelService} from '../services/ram-model.service';
import {RAMRouteService} from '../services/ram-route.service';
import {RAMNavService} from '../services/ram-nav.service';

import {BannerComponent} from '../components/banner/banner.component';
import {BannerService} from '../components/banner/banner.service';
import {ErrorComponent} from '../components/error/error.component';
import {ErrorService} from '../components/error/error.service';
import {TranslateService} from 'ng2-translate/ng2-translate';

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
        BannerService,
        ErrorService
    ]
})

export class AppComponent {

    constructor(translate: TranslateService) {
        let userLang = navigator.language.split('-')[0]; // use navigator lang if available
        userLang = /(fr|en)/gi.test(userLang) ? userLang : 'en';
        translate.setDefaultLang('en');
        // the lang to use, if the lang isn't available, it will use the loader defined to get them
        translate.use(userLang);
        // uncomment these two lines to test that you're using translation - it will just display the key you're using instead of any translation
        // translate.setDefaultLang('test');
        // translate.use('test');
    }

}