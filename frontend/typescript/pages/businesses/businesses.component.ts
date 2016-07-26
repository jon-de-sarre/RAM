import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';
import {Observable} from "rxjs/Observable";

import {
    ISearchResult,
    IParty,
    IHrefValue,
    FilterParams
} from '../../../../commons/RamAPI2';
import {Params} from '../../../jspm_packages/npm/@angular/router@3.0.0-beta.2/esm/src/shared';
import {SearchResultPaginationDelegate} from '../../components/search-result-pagination/search-result-pagination.component';

@Component({
    selector: 'ram-business-relationships',
    templateUrl: 'businesses.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent
    ]
})

export class BusinessesComponent extends AbstractPageComponent {
    public filter: FilterParams;
    public page: number;

    public parties$: Observable<ISearchResult<IHrefValue<IParty>>>;
    public partyRefs: IHrefValue<IParty>[];
    public paginationDelegate: SearchResultPaginationDelegate;
    private _isLoading = false; // set to true when you want the UI indicate something is getting loaded.

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Software Provider Services');
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        this._isLoading = true;
        this.filter = new FilterParams();
        this.filter.add('partyType', 'ABN');
        this.filter.add('authorisationManagement', true);

        // extract path and query parameters
        this.page = params.query['page'] ? +params.query['page'] : 1;

        this.partyRefs = [];
        this.parties$ = this.services.rest.searchDistinctSubjectsForMe(this.filter.encode(), this.page);
        this.parties$.subscribe((partyRefs) => {
            this._isLoading = false;
            this.partyRefs = partyRefs.list;
        }, (err) => {
            this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
            this._isLoading = false;
        });

        // pagination delegate
        this.paginationDelegate = {
            goToPage: (page: number) => {
                this.services.route.goToBusinessesPage(page);
            }
        } as SearchResultPaginationDelegate;

        this._isLoading = false;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public goToNotificationsContext(partyResource: IHrefValue<IParty>) {
        const defaultIdentityResource = this.services.model.getDefaultIdentityResource(partyResource.value);
        if (defaultIdentityResource) {
            const identityIdValue = defaultIdentityResource.value.idValue;
            this.goToNotificationsPage(identityIdValue);
        }
    }

    public goToNotificationsPage(idValue: string) {
        this.services.route.goToNotificationsPage(idValue);
    };
}
