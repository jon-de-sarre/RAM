import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {SearchResultPaginationComponent, SearchResultPaginationDelegate}
    from '../../components/search-result-pagination/search-result-pagination.component';
import {RAMServices} from '../../services/ram-services';

import {
    ISearchResult,
    IParty,
    IIdentity,
    IRelationship,
    IRelationshipStatus,
    IHrefValue,
    FilterParams
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-osp-notifications',
    templateUrl: 'notifications.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent,
        SearchResultPaginationComponent
    ]
})

export class NotificationsComponent extends AbstractPageComponent {

    public identityHref: string;
    public filter: FilterParams;
    public page: number;

    public relationships$: Observable<ISearchResult<IHrefValue<IRelationship>>>;
    public relationshipStatusRefs: IHrefValue<IRelationshipStatus>[];

    public canReturnToDashboard: boolean = false;

    public identity: IIdentity;

    public paginationDelegate: SearchResultPaginationDelegate;

    private _isLoading = false; // set to true when you want the UI indicate something is getting loaded.

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Software Provider Services');
    }

    public onInit(params: {path: Params, query: Params}) {

        this._isLoading = true;

        // extract path and query parameters
        this.identityHref = params.path['identityHref'];
        this.filter = FilterParams.decode(params.query['filter']);
        this.page = params.query['page'] ? +params.query['page'] : 1;

        // restrict to notifications
        this.filter.add('relationshipTypeCategory', this.services.constants.RelationshipTypeCategory.NOTIFICATION);

        // message
        const msg = params.query['msg'];
        if (msg === 'CREATED_RELATIONSHIP') {
            this.addGlobalMessage('A notification has been created.');
        }

        // identity in focus
        this.services.rest.findIdentityByHref(this.identityHref).subscribe((identity) => {

            this.identity = identity;

            // relationships
            this.relationships$ = this.services.rest.searchRelationshipsByIdentity(this.identity.idValue, this.filter.encode(), this.page);
            this.relationships$.subscribe((searchResult) => {
                this._isLoading = false;
            }, (err) => {
                this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
                this._isLoading = false;
            });

        });

        // if the user can see more than one business, they can see the dashboard
        // this.services.rest.searchDistinctSubjectsForMe(null, 1).subscribe((partyRefs) => {
        //     this.canReturnToDashboard = partyRefs.totalCount > 1;
        // });
        this.canReturnToDashboard = true; // TODO compute this properly

        // relationship statuses
        this.services.rest.listRelationshipStatuses().subscribe((relationshipStatusRefs) => {
            this.relationshipStatusRefs = relationshipStatusRefs;
        });

        // pagination delegate
        this.paginationDelegate = {
            goToPage: (page: number) => {
                this.services.route.goToNotificationsPage(this.identityHref, page);
            }
        } as SearchResultPaginationDelegate;

    }

    public goToBusinessesPage() {
        this.services.route.goToBusinessesPage();
    }

    public goToAddNotificationPage() {
        this.services.route.goToAddNotificationPage(this.identityHref);
    }

    public goToEditNotificationPage(relationshipRef: IHrefValue<IRelationship>) {
        this.services.route.goToEditNotificationPage(this.identityHref, relationshipRef.href);
    }

    // todo what is the logic here?
    public isAddNotificationEnabled() {
        return true;
    }

}
