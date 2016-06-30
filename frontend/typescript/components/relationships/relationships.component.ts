import {Component} from '@angular/core';
import {RelationshipsTableComponent} from '../relationships-table/relationships-table.component';
import {RouteParams} from '@angular/router-deprecated';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import Rx from 'rxjs/Rx';
import {RAMRestService} from '../../services/ram-rest.service';
import {RAMIdentityService} from '../../services/ram-identity.service';
import {
    ISearchResult,
    IName,
    IParty,
    IRelationship,
    IRelationshipType,
    IHrefValue
} from '../../../../commons/RamAPI2';

@Component({
    selector: 'ram-relationships',
    templateUrl: 'relationships.component.html',
    directives: [RelationshipsTableComponent, ROUTER_DIRECTIVES],
})

export class RelationshipsComponent {

    public idValue:string;

    public identityDisplayName$:Rx.Observable<IName>;
    public subjectsResponse$:Rx.Observable<ISearchResult<IHrefValue<IParty>[]>>;
    public relationshipsResponse$:Rx.Observable<ISearchResult<IHrefValue<IRelationship>[]>>;

    // todo rename to relationshipTypeHrefs
    public relationshipTypes: IHrefValue<IRelationshipType>[] = [];
    public subjectHrefValue: IHrefValue<IParty>;

    private _isLoading = false; // set to true when you want the UI indicate something is getting loaded.

    constructor(private routeParams:RouteParams,
                private identityService:RAMIdentityService,
                private rest:RAMRestService) {
    }

    public ngOnInit() {
        this._isLoading = true;
        this.idValue = this.routeParams.get('idValue');
        this.identityDisplayName$ = this.identityService.getDefaultName(this.idValue).map(this.displayName);
        this.subjectsResponse$ = this.rest.searchDistinctSubjectsBySubjectOrDelegateIdentity(this.idValue, 1);
        this.subjectsResponse$.subscribe((searchResult) => {
            this._isLoading = false;
        }, (err) => {
            alert(JSON.stringify(err, null, 4));
            this._isLoading = false;
        });
        this.rest.listRelationshipTypes().subscribe((relationshipTypes) => {
            this.relationshipTypes = relationshipTypes;
        }, (err) => {
            alert(JSON.stringify(err, null, 4));
            this._isLoading = false;
        });
    }

    public displayName(name:IName):string {
        if (name) {
            return name.unstructuredName ? name.unstructuredName : name.givenName + ' ' + name.familyName;
        }
        return '';
    }

    public displayNameForParty(subject:IParty):string {
        if (subject && subject.identities && subject.identities.length > 0) {
            for (const identityHrefValue of subject.identities) {
                const identity = identityHrefValue.value;
                if (identity.defaultInd) {
                    const name = identity.profile.name;
                    return this.displayName(name);
                }
            }
            return this.displayName(subject.identities[0].value.profile.name);
        }
        return '';
    }

    public commaSeparatedListOfProviderNames(subject:IParty):string {
        let providerNames: string[] = [];
        if (subject) {
            if (subject && subject.identities && subject.identities.length > 0) {
                for (const identityHrefValue of subject.identities) {
                    providerNames.push(identityHrefValue.value.profile.provider);
                }
            }
        }
        return providerNames.join(',');
    }

    public getOtherParty = (relationship:IRelationship) => {
        if (this.subjectHrefValue) {
            if (relationship.subject.href === this.subjectHrefValue.href) {
                return relationship.delegate.value;
            } else {
                return relationship.subject.value;
            }
        }
        return null;
    };

    public getRelationshipTypeLabel = (relationship:IRelationship) => {
        let relationshipTypeHrefString = relationship.relationshipType.href;
        for (let aRelationshipTypeHref of this.relationshipTypes) {
            if (aRelationshipTypeHref.href === relationshipTypeHrefString) {
                return aRelationshipTypeHref.value.shortDecodeText;
            }
        }
        return '';
    };

    public backToListing = () => {
        this.subjectHrefValue = null;
    };

    public expandSubject = (subjectHrefValue:IHrefValue<IParty>) => {
        this._isLoading = true;
        this.subjectHrefValue = subjectHrefValue;
        if (subjectHrefValue.value.identities.length > 0) {
            const idValue = subjectHrefValue.value.identities[0].value.idValue;
            this.relationshipsResponse$ = this.rest.searchRelationshipsByIdentity(idValue, 1);
            this.relationshipsResponse$.subscribe(() => {
                this._isLoading = false;
            }, (err) => {
                alert(JSON.stringify(err, null, 4));
                this._isLoading = false;
            });
        }
    };

    public get isLoading() {
        return this._isLoading;
    }

}