import 'rxjs/add/operator/merge';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {FormBuilder} from '@angular/forms';

import {RAMServices} from '../../services/ram-services';

export abstract class AbstractPageComponent implements OnInit, OnDestroy {

    protected globalMessages: string[];

    protected mergedParamSub: Subscription;
    protected pathParamSub: Subscription;
    protected queryParamSub: Subscription;

    constructor(public route: ActivatedRoute,
                public router: Router,
                public fb: FormBuilder,
                public services: RAMServices) {
    }

    /* tslint:disable:max-func-body-length */
    public ngOnInit() {

        // subscribe to path and query params
        this.subscribeToPathAndQueryParams();

    }

    public ngOnDestroy() {
        if (this.mergedParamSub) {
            this.mergedParamSub.unsubscribe();
        }
        if (this.pathParamSub) {
            this.pathParamSub.unsubscribe();
        }
        if (this.queryParamSub) {
            this.queryParamSub.unsubscribe();
        }
        this.onDestroy();
    }

    /* tslint:disable:no-empty */
    public onPreInit(params: {path: Params, query: Params}) {
        this.clearGlobalMessages();
        this.onInit(params);
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    }

    /* tslint:disable:no-empty */
    public onInit(params: {path: Params, query: Params}) {
    }

    /* tslint:disable:no-empty */
    public onDestroy() {
    }

    private subscribeToPathAndQueryParams() {

        let pathParams: Params;
        let queryParams: Params;

        const pathParams$ = this.route.params;
        const queryParams$ = this.router.routerState.queryParams;

        this.mergedParamSub = Observable.merge(pathParams$, queryParams$)
            .subscribe((params) => {
                if (!pathParams) {
                    this.log('-----------');
                    this.log('[i] PATH  = ' + JSON.stringify(params));
                    pathParams = params;
                } else if (!queryParams) {
                    this.log('[i] QUERY = ' + JSON.stringify(params));
                    queryParams = params;
                    this.onPreInit(this.decodeURIComponentForParams(pathParams, queryParams));
                } else if (this.mergedParamSub) {
                    this.log('-----------');
                    this.log('Unsubscribing from merged observable ...');
                    this.mergedParamSub.unsubscribe();
                    this.pathParamSub = pathParams$.subscribe((params) => {
                        if (!this.isEqual(pathParams, params)) {
                            this.log('-----------');
                            pathParams = params;
                            this.log('[p] PARAMS = ' + JSON.stringify(params));
                            this.log('[p] PATH   = ' + JSON.stringify(pathParams));
                            this.log('[p] QUERY  = ' + JSON.stringify(queryParams));
                            this.onPreInit(this.decodeURIComponentForParams(pathParams, queryParams));
                        }
                    });
                    this.queryParamSub = queryParams$.subscribe((params) => {
                        if (!this.isEqual(queryParams, params)) {
                            this.log('-----------');
                            queryParams = params;
                            this.log('[p] PARAMS = ' + JSON.stringify(params));
                            this.log('[p] PATH   = ' + JSON.stringify(pathParams));
                            this.log('[p] QUERY  = ' + JSON.stringify(queryParams));
                            this.onPreInit(this.decodeURIComponentForParams(pathParams, queryParams));
                        }
                    });
                }
            });

    }

    protected decodeURIComponentForParams(pathParams: Params, queryParams: Params): {path: Params, query: Params} {
        let decodedPathParams = {} as Params;
        if (pathParams) {
            for (let key of Object.keys(pathParams)) {
                decodedPathParams[key] = this.services.route.decodeURIComponent(key, pathParams[key]);
            }
        }
        let decodedQueryParams = {} as Params;
        if (queryParams) {
            for (let key of Object.keys(queryParams)) {
                decodedQueryParams[key] = this.services.route.decodeURIComponent(key, queryParams[key]);
            }
        }
        return {
            path: decodedPathParams,
            query: decodedQueryParams
        };
    }

    protected setBannerTitle(title: string) {
        this.services.banner.setTitle(title);
    }

    protected addGlobalMessage(message: string) {
        if (this.globalMessages.indexOf(message) === -1) {
            this.globalMessages.push(message);
        }
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    }

    protected addGlobalMessages(messages: string[]) {
        if (messages) {
            for (let message of messages) {
                this.addGlobalMessage(message);
            }
        }
    }

    protected addGlobalErrorMessages(response: Response) {
        if (response) {
            let messages = this.services.rest.extractErrorMessages(response);
            this.addGlobalMessages(messages);
        }
    }

    protected clearGlobalMessages() {
        this.globalMessages = [];
    }

    protected hasGlobalMessages(): boolean {
        return this.globalMessages && this.globalMessages.length > 0;
    }

    protected onServerError(err: Response) {
        const status = err.status;
        if (status === 401 || status === 403) {
            this.services.route.goToAccessDeniedPage();
        } else {
            this.addGlobalErrorMessages(err);
        }
    }

    private isEqual(params1: Params, params2: Params): boolean {
        return params1 && params2 && JSON.stringify(params1) === JSON.stringify(params2);
    }

    private log(msg: string): void {
        //console.log(msg);
    }

}