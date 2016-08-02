import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {SearchResultPaginationComponent, SearchResultPaginationDelegate}
    from '../../components/search-result-pagination/search-result-pagination.component';
import {RAMServices} from '../../services/ram-services';

import {
    ISearchResult,
    IParty,
    IPartyType,
    IProfileProvider,
    IIdentity,
    IRelationship,
    IRelationshipType,
    IRelationshipStatus,
    IHrefValue,
    FilterParams
} from '../../../../commons/RamAPI';

@Component({
    selector: 'list-relationships',
    templateUrl: 'relationships.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        FORM_DIRECTIVES,
        REACTIVE_FORM_DIRECTIVES,
        PageHeaderAuthComponent,
        SearchResultPaginationComponent
    ]
})

export class RelationshipsComponent extends AbstractPageComponent {

    public idValue: string;
    public filter: FilterParams;
    public page: number;

    public relationships$: Observable<ISearchResult<IHrefValue<IRelationship>>>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;
    public partyTypeRefs: IHrefValue<IPartyType>[];
    public profileProviderRefs: IHrefValue<IProfileProvider>[];
    public relationshipStatusRefs: IHrefValue<IRelationshipStatus>[];
    public relationshipTypeRefs: IHrefValue<IRelationshipType>[];
    public subjectGroupsWithRelationships: SubjectGroupWithRelationships[];

    public paginationDelegate: SearchResultPaginationDelegate;
    public form: FormGroup;

    private _isLoading = false; // set to true when you want the UI indicate something is getting loaded.

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices,
                private _fb: FormBuilder) {
        super(route, router, services);
        this.setBannerTitle('Authorisations');
    }

    // todo need some way to indicate ALL the loading has finished; not a priority right now
    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        this._isLoading = true;

        // extract path and query parameters
        this.idValue = decodeURIComponent(params.path['idValue']);
        this.filter = FilterParams.decode(params.query['filter']);
        this.page = params.query['page'] ? +params.query['page'] : 1;

        // restrict to authorisations
        this.filter.add('relationshipTypeCategory', this.services.constants.RelationshipTypeCategory.AUTHORISATION)

        // message
        const msg = params.query['msg'];
        if (msg === 'DELEGATE_NOTIFIED') {
            this.addGlobalMessage('A notification has been sent to the delegate.');
        } else if (msg === 'DECLINED_RELATIONSHIP') {
            this.addGlobalMessage('You have declined the relationship.');
        } else if (msg === 'ACCEPTED_RELATIONSHIP') {
            this.addGlobalMessage('You have accepted the relationship.');
        } else if (msg === 'CANCEL_ACCEPT_RELATIONSHIP') {
            this.addGlobalMessage('You cancelled without accepting or declining the relationship');
        }

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // party types
        this.services.rest.listPartyTypes().subscribe((partyTypeRefs) => {
            this.partyTypeRefs = partyTypeRefs;
        });

        // profile providers
        this.services.rest.listProfileProviders().subscribe((profileProviderRefs) => {
            this.profileProviderRefs = profileProviderRefs;
        });

        // relationship statuses
        this.services.rest.listRelationshipStatuses().subscribe((relationshipStatusRefs) => {
            this.relationshipStatusRefs = relationshipStatusRefs;
        });

        // relationship types
        this.services.rest.listRelationshipTypes().subscribe((relationshipTypeRefs) => {
            this.relationshipTypeRefs = relationshipTypeRefs.filter((relationshipType) => {
                return relationshipType.value.category === this.services.constants.RelationshipTypeCategory.AUTHORISATION;
            });
        });

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
                this.services.route.goToRelationshipsPage(this.idValue, this.filter.encode(), page);
            }
        } as SearchResultPaginationDelegate;

        // forms
        this.form = this._fb.group({
            partyType: this.filter.get('partyType', '-'),
            relationshipType: this.filter.get('relationshipType', '-'),
            profileProvider: this.filter.get('profileProvider', '-'),
            status: this.filter.get('status', '-'),
            text: this.filter.get('text', ''),
            sort: this.filter.get('sort', '-')
        });

    }

    public commaSeparatedListOfProviderNames(subject: IParty): string {
        let providerNames: string[] = [];
        if (subject) {
            if (subject && subject.identities && subject.identities.length > 0) {
                for (const identityHrefValue of subject.identities) {
                    let label = this.services.model.profileProviderLabel(
                        this.profileProviderRefs,
                        identityHrefValue.value.profile.provider
                    );
                    providerNames.push(label);
                }
            }
        }
        return providerNames.join(',');
    }

    public get isLoading() {
        return this._isLoading;
    }

    public search() {
        const filterString = new FilterParams()
            .add('partyType', this.form.controls['partyType'].value)
            .add('relationshipType', this.form.controls['relationshipType'].value)
            .add('profileProvider', this.form.controls['profileProvider'].value)
            .add('status', this.form.controls['status'].value)
            .add('text', this.form.controls['text'].value)
            .add('sort', this.form.controls['sort'].value)
            .encode();
        //console.log('Filter (encoded): ' + filterString);
        //console.log('Filter (decoded): ' + JSON.stringify(FilterParams.decode(filterString), null, 4));
        this.services.route.goToRelationshipsPage(this.idValue, filterString);
    }

    public goToRelationshipAddPage() {
        this.services.route.goToRelationshipAddPage(this.idValue);
    };

    public goToRelationshipEnterCodePage() {
        this.services.route.goToRelationshipEnterCodePage(this.idValue);
    };

    public goToRelationshipsContext(partyResource: IHrefValue<IParty>) {
        const defaultIdentityResource = this.services.model.getDefaultIdentityResource(partyResource.value);
        if (defaultIdentityResource) {
            const identityIdValue = defaultIdentityResource.value.idValue;
            this.services.route.goToRelationshipsPage(identityIdValue);
        }
    }

}

class SubjectGroupWithRelationships {

    public subjectRef: IHrefValue<IParty>;
    public relationshipRefs: IHrefValue<IRelationship>[] = [];

    public hasSameSubject(aSubjectRef: IHrefValue<IParty>) {
        return this.subjectRef.href === aSubjectRef.href;
    }

}