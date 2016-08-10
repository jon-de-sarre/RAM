import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {Response, Http, Headers} from '@angular/http';

import {RAMModelService} from './ram-model.service';

import {
    ISearchResult,
    IHrefValue,
    IPrincipal,
    IAgencyUser,
    IIdentity,
    IParty,
    IPartyType,
    IProfileProvider,
    IInvitationCodeRelationshipAddDTO,
    IRelationship,
    IRelationshipType,
    IRelationshipStatus,
    IRole,
    IRoleType,
    IRoleStatus,
    INotifyDelegateDTO,
    IAUSkey
} from '../../../commons/RamAPI';
import {ABRentry} from '../../../commons/abr';

class Href {

    constructor(private href: string) {
    }

    public param(paramKey: string, paramValue: string|number|boolean, condition: boolean = true): Href {
        if (condition && paramValue !== undefined && paramValue !== null) {
            this.href += this.href.indexOf('?') === -1 ? '?' : '&';
            this.href += paramKey + '=' + paramValue;
        }
        return this;
    }

    public toString(): string {
        return this.href;
    }

}

@Injectable()
export class RAMRestService {

    constructor(private http: Http,
                private modelService: RAMModelService) {
    }

    // auskey ...........................................................................................................

    public searchAusKeysByHref(href: string, filter: string, page: number): Observable<ISearchResult<IHrefValue<IAUSkey>>> {
        return this.http
            .get(new Href(href).param('filter', filter).param('page', page).toString())
            .map(this.extractData);
    }

    // misc ...........................................................................................................

    /*
     * Old interface used when adding a business relationship. Now
     * delegates to the ABR for the real work.
     */
    public getOrganisationNameFromABN(abn: string) {
        return this.getABRfromABN(abn).map((abr: ABRentry) => abr.name);
    }

    /*
     * This goes out to the ABR (external source) and returns with
     * limited company data for a single organisation - or an 404
     * if the abn doesn't exist.
     */
    public getABRfromABN(abn: string) {
        return this.http
            .get(`/api/v1/business/abn/` + abn)
            .map(this.extractData);
    }

    /*
     * This goes out to the ABR (external source) and returns with
     * limited company data for a many organisations. Not sure if the
     * name doesn't match anything because I could not find one :)
     */
    public getABRfromName(name: string) {
        return this.http
            .get(`/api/v1/business/name/` + name)
            .map(this.extractData);
    }

    /*
     * This is RAM internal to create identity and party records
     * (if needed) for an organisation of interest retrieved
     * from the ABR.
     */
    public registerABRCompany(abr: ABRentry): Observable<IIdentity> {
        return this.http
            .get(`/api/v1/business/register/` + abr.abn + '/' + abr.name)
            .map(this.extractData);
    }

    // principal ......................................................................................................

    public findMyPrincipal(): Observable<IPrincipal> {
        return this.http
            .get(`/api/v1/me`)
            .map(this.extractData);
    }

    // agency user ....................................................................................................

    public findMyAgencyUser(): Observable<IAgencyUser> {
        return this.http
            .get(`/api/v1/agencyUser/me`)
            .map(this.extractData);
    }

    // party ..........................................................................................................

    public findPartyByABN(abn: string): Observable<IParty> {
        const idValue = `PUBLIC_IDENTIFIER:ABN:${abn}`;
        return this.http
            .get(`/api/v1/party/identity/${idValue}`)
            .map(this.extractData);
    }

    // identity .......................................................................................................

    public findMyIdentity(): Observable<IIdentity> {
        return this.http
            .get(`/api/v1/identity/me`)
            .map(this.extractData);
    }

    public findIdentityByValue(identityValue: string): Observable<IIdentity> {
        return this.http
            .get(`/api/v1/identity/${identityValue}`)
            .map(this.extractData);
    }

    public findIdentityByHref(href: string): Observable<IIdentity> {
        return this.http
            .get(href)
            .map(this.extractData);
    }

    // party type .....................................................................................................

    public listPartyTypes(): Observable<IHrefValue<IPartyType>[]> {
        return this.http
            .get('/api/v1/partyTypes')
            .map(this.extractData);
    }

    // profile provider ...............................................................................................

    public listProfileProviders(): Observable<IHrefValue<IProfileProvider>[]> {
        return this.http
            .get('/api/v1/profileProviders')
            .map(this.extractData);
    }

    // relationship ...................................................................................................

    public listRelationshipStatuses(): Observable<IHrefValue<IRelationshipStatus>[]> {
        return this.http
            .get('/api/v1/relationshipStatuses')
            .map(this.extractData);
    }

    public searchDistinctSubjectsForMe(filter: string,
                                       page: number): Observable<ISearchResult<IHrefValue<IParty>>> {
        return this.http
            .get(`/api/v1/relationships/identity/subjects?filter=${filter}&page=${page}`)
            .map(this.extractData);
    }

    public searchRelationshipsByIdentity(idValue: string,
                                         filter: string,
                                         page: number): Observable<ISearchResult<IHrefValue<IRelationship>>> {
        return this.http
            .get(`/api/v1/relationships/identity/${idValue}?filter=${filter}&page=${page}`)
            .map(this.extractData);
    }

    public searchDistinctSubjectsBySubjectOrDelegateIdentity(idValue: string,
                                                             page: number): Observable<ISearchResult<IHrefValue<IParty>>> {
        return this.http
            .get(`/api/v1/relationships/identity/${idValue}/subjects?page=${page}`)
            .map(this.extractData);
    }

    public claimRelationshipByInvitationCode(invitationCode: string): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship/invitationCode/${invitationCode}/claim`, '')
            .map(this.extractData);
    }

    public findRelationshipByHref(href: string): Observable<IRelationship> {
        return this.http
            .get(href)
            .map(this.extractData);
    }

    public findPendingRelationshipByInvitationCode(invitationCode: string): Observable<IRelationship> {
        return this.http
            .get(`/api/v1/relationship/invitationCode/${invitationCode}`)
            .map(this.extractData);
    }

    public acceptPendingRelationshipByInvitationCode(relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(this.modelService.getLinkHrefByType('accept', relationship._links), '')
            .map(this.extractData);
    }

    public rejectPendingRelationshipByInvitationCode(relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(this.modelService.getLinkHrefByType('reject', relationship._links), '')
            .map(this.extractData);
    }

    public notifyDelegateByInvitationCode(invitationCode: string, notification: INotifyDelegateDTO): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship/invitationCode/${invitationCode}/notifyDelegate`, JSON.stringify(notification), {
                headers: this.headersForJson()
            })
            .map(this.extractData);
    }

    public createRelationship(relationship: IInvitationCodeRelationshipAddDTO): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship`, JSON.stringify(relationship), {
                headers: this.headersForJson()
            })
            .map(this.extractData);
    }

    public createRelationship2(relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship2`, JSON.stringify(relationship), {
                headers: this.headersForJson()
            })
            .map(this.extractData);
    }

    // relationship type ..............................................................................................

    public findRelationshipTypeByCode(code: string): Observable<IRelationshipType> {
        return this.http
            .get(`/api/v1/relationshipType/${code}`)
            .map(this.extractData);
    }

    public findRelationshipTypeByHref(href: string): Observable<IRelationshipType> {
        return this.http
            .get(href)
            .map(this.extractData);
    }

    public listRelationshipTypes(): Observable<IHrefValue<IRelationshipType>[]> {
        return this.http
            .get('/api/v1/relationshipTypes')
            .map(this.extractData);
    }

    // role ...........................................................................................................

    public searchRolesByHref(href: string,
                             page: number): Observable<ISearchResult<IHrefValue<IRole>>> {
        return this.http
            .get(new Href(href).param('page', page).toString())
            .map(this.extractData);
    }

    public findRoleByHref(href: string): Observable<IRole> {
        return this.http
            .get(href)
            .map(this.extractData);
    }

    public findRoleTypeByHref(href: string): Observable<IRoleType> {
        return this.http
            .get(href)
            .map(this.extractData);
    }

    public createRole(role: IRole): Observable<IRole> {
        return this.http
            .post(`/api/v1/role`, JSON.stringify(role), {
                headers: this.headersForJson()
            })
            .map(this.extractData);
    }

    // role status ....................................................................................................

    public listRoleStatuses(): Observable<IHrefValue<IRoleStatus>[]> {
        return this.http
            .get('/api/v1/roleStatuses')
            .map(this.extractData);
    }

    // role type ......................................................................................................

    public listRoleTypes(): Observable<IHrefValue<IRoleType>[]> {
        return this.http
            .get('/api/v1/roleTypes')
            .map(this.extractData);
    }

    // misc ...........................................................................................................

    public extractErrorMessages(response: Response): string[] {
        const json = response.json();
        if (json && json.alert && json.alert.messages) {
            return json.alert.messages;
        }
        return ['An unknown error has occurred.'];
    }

    private headersForJson() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return headers;
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Status code is:' + res.status);
        }
        const body = res.json();
        return body || {};
    }

}