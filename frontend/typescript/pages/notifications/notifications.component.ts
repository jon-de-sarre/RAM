import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {SearchResultPaginationDelegate}
    from '../../components/search-result-pagination/search-result-pagination.component';
import {RAMServices} from '../../services/ram-services';

import {
    ISearchResult,
    IParty,
    IIdentity,
    IRelationship,
    IHrefValue,
    FilterParams
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-osp-notifications',
    templateUrl: 'notifications.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent
    ]
})

export class NotificationsComponent extends AbstractPageComponent {

    public idValue: string;
    public filter: FilterParams;
    public page: number;

    public relationships$: Observable<ISearchResult<IHrefValue<IRelationship>>>;

    public canReturnToDashboard: boolean = false;

    public identity: IIdentity;
    public subjectGroupsWithRelationships: SubjectGroupWithRelationships[];

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
        this.idValue = decodeURIComponent(params.path['idValue']);
        this.filter = FilterParams.decode(params.query['filter']);
        this.page = params.query['page'] ? +params.query['page'] : 1;

        // restrict to notifications
        this.filter.add('relationshipTypeCategory', this.services.constants.RelationshipTypeCategory.NOTIFICATION);

        // message
        // const msg = params.query['msg'];

        // TODO

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // if the user can see more than one business, they can see the dashboard
        // this.services.rest.searchDistinctSubjectsForMe(null, 1).subscribe((partyRefs) => {
        //     this.canReturnToDashboard = partyRefs.totalCount > 1;
        // });
        this.canReturnToDashboard = true; // TODO compute this properly

        // relationships
        this.subjectGroupsWithRelationships = [];
        this.relationships$ = this.services.rest.searchRelationshipsByIdentity(this.idValue, this.filter.encode(), this.page);
        this.relationships$.subscribe((relationshipRefs) => {
            this._isLoading = false;
            for (const relationshipRef of relationshipRefs.list) {
                let subjectGroupWithRelationshipsToAddTo: SubjectGroupWithRelationships;
                const subjectRef = relationshipRef.value.subject;
                for (const subjectGroupWithRelationships of this.subjectGroupsWithRelationships) {
                    if (subjectGroupWithRelationships.hasSameSubject(subjectRef)) {
                        subjectGroupWithRelationshipsToAddTo = subjectGroupWithRelationships;
                    }
                }
                if (!subjectGroupWithRelationshipsToAddTo) {
                    subjectGroupWithRelationshipsToAddTo = new SubjectGroupWithRelationships();
                    subjectGroupWithRelationshipsToAddTo.subjectRef = subjectRef;
                    this.subjectGroupsWithRelationships.push(subjectGroupWithRelationshipsToAddTo);
                }
                subjectGroupWithRelationshipsToAddTo.relationshipRefs.push(relationshipRef);
            }
        }, (err) => {
            this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
            this._isLoading = false;
        });

        // pagination delegate
        this.paginationDelegate = {
            goToPage: (page: number) => {
                // TODO
                alert('NOT IMPLEMENTED');
                // this.services.route.goToBusinessesPage(this.idValue, this.filter.encode(), page);
            }
        } as SearchResultPaginationDelegate;

    }

    public goToBusinessesPage() {
        this.services.route.goToBusinessesPage();
    }
}

class SubjectGroupWithRelationships {

    public subjectRef: IHrefValue<IParty>;
    public relationshipRefs: IHrefValue<IRelationship>[] = [];

    public hasSameSubject(aSubjectRef: IHrefValue<IParty>) {
        return this.subjectRef.href === aSubjectRef.href;
    }
}