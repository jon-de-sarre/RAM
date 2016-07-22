import Rx from 'rxjs/Rx';
import {OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router, Params} from '@angular/router';

import {RAMServices} from '../../services/ram-services';

export abstract class AbstractPageComponent implements OnInit, OnDestroy {

    protected globalMessages: string[];

    protected mergedParamSub: Rx.Subscription;
    protected pathParamSub: Rx.Subscription;
    protected queryParamSub: Rx.Subscription;

    constructor(public route: ActivatedRoute,
                public router: Router,
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

        this.mergedParamSub = Rx.Observable.merge(pathParams$, queryParams$)
            .subscribe((params) => {
                if (!pathParams) {
                    this.log('-----------');
                    this.log('[i] PATH  = ' + JSON.stringify(params));
                    pathParams = params;
                } else if (!queryParams) {
                    this.log('[i] QUERY = ' + JSON.stringify(params));
                    queryParams = params;
                    this.onPreInit({path: pathParams, query: queryParams});
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
                            this.onPreInit({path: pathParams, query: queryParams});
                        }
                    });
                    this.queryParamSub = queryParams$.subscribe((params) => {
                        if (!this.isEqual(queryParams, params)) {
                            this.log('-----------');
                            queryParams = params;
                            this.log('[p] PARAMS = ' + JSON.stringify(params));
                            this.log('[p] PATH   = ' + JSON.stringify(pathParams));
                            this.log('[p] QUERY  = ' + JSON.stringify(queryParams));
                            this.onPreInit({path: pathParams, query: queryParams});
                        }
                    });
                }
            });

    }

    protected addGlobalMessage(message: string) {
        this.globalMessages.push(message);
    }

    protected addGlobalMessages(messages: string[]) {
        if (messages) {
            for (let message of messages) {
                this.globalMessages.push(message);
            }
        }
    }

    protected clearGlobalMessages() {
        this.globalMessages = [];
    }

    protected setBannerTitle(title: string) {
        this.services.banner.setTitle(title);
    }

    protected hasGlobalMessages(): boolean {
        return this.globalMessages && this.globalMessages.length > 0;
    }

    private isEqual(params1: Params, params2: Params): boolean {
        return params1 && params2 && JSON.stringify(params1) === JSON.stringify(params2);
    }

    private log(msg: string): void {
        //console.log(msg);
    }

}