/// <reference path="../typings/index.d.ts" />

import 'es6-shim';
import 'zone';
import 'reflect-metadata';
import 'rxjs/Rx';
import 'jquery/dist/jquery';
import 'ng2-bootstrap';
import 'primeui/primeui-ng-all';

import {bootstrap} from '@angular/platform-browser-dynamic';
import {AppComponent} from './app/app.component';
import {APP_ROUTER_PROVIDERS} from './routes';
import {PLATFORM_PIPES} from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {HTTP_PROVIDERS} from '@angular/http';
import {TRANSLATE_PROVIDERS, TranslatePipe} from 'ng2-translate/ng2-translate';

// enableProdMode();

bootstrap(AppComponent, [APP_ROUTER_PROVIDERS,
    disableDeprecatedForms(),
    provideForms(),
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: PLATFORM_PIPES, useValue: TranslatePipe, multi: true},
    HTTP_PROVIDERS,
    TRANSLATE_PROVIDERS]
).catch(err => console.error(err));