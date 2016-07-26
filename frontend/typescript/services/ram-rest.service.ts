import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {Response, Http, Headers} from '@angular/http';

import {RAMModelService} from './ram-model.service';

import {
    ISearchResult,
    IHrefValue,
    IPrincipal,
    IIdentity,
    IParty,
    IPartyType,
    IProfileProvider,
    IRelationshipAddDTO,
    IRelationship,
    IRelationshipType,
    IRelationshipStatus,
    INotifyDelegateDTO
} from '../../../commons/RamAPI2';

@Injectable()
export class RAMRestService {

    constructor(private http: Http,
                private modelService: RAMModelService) {
    }

    // TODO remove temporary api
    // A call external to RAM to get organisation name from ABN
    public getOrganisationNameFromABN(abn: string) {
        // This is temporary until we can talk to the server
        // How about mocking framework?
        return Promise.resolve('The End of Time Pty Limited');
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Status code is:' + res.status);
        }
        const body = res.json();
        return body || {};
    }

    public findMyPrincipal(): Observable<IPrincipal> {
        return this.http
            .get(`/api/v1/me`)
            .map(this.extractData);
    }

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

    public listPartyTypes(): Observable<IHrefValue<IPartyType>[]> {
        return this.http
            .get('/api/v1/partyTypes')
            .map(this.extractData);
    }

    public listProfileProviders(): Observable<IHrefValue<IProfileProvider>[]> {
        return this.http
            .get('/api/v1/profileProviders')
            .map(this.extractData);
    }

    public findRelationshipTypeByCode(code: string): Observable<IRelationshipType> {
        return this.http
            .get(`/api/v1/relationshipType/${code}`)
            .map(this.extractData);
    }

    public listRelationshipTypes(): Observable<IHrefValue<IRelationshipType>[]> {
        return this.http
            .get('/api/v1/relationshipTypes')
            .map(this.extractData);
    }

    public findRelationshipTypeByHref(href: string): Observable<IRelationshipType> {
        return this.http
            .get(href)
            .map(this.extractData);
    }

    public claimRelationshipByInvitationCode(invitationCode: string): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship/invitationCode/${invitationCode}/claim`, '')
            .map(this.extractData);
    }

    public findPendingRelationshipByInvitationCode(invitationCode: string): Observable<IRelationship> {
        return this.http
            .get(`/api/v1/relationship/invitationCode/${invitationCode}`)
            .map(this.extractData);
    }

    public acceptPendingRelationshipByInvitationCode(relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(this.modelService.linkByType('accept', relationship._links).href, '')
            .map(this.extractData);
    }

    public rejectPendingRelationshipByInvitationCode(relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(this.modelService.linkByType('reject', relationship._links).href, '')
            .map(this.extractData);
    }

    public notifyDelegateByInvitationCode(invitationCode: string, notification: INotifyDelegateDTO): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship/invitationCode/${invitationCode}/notifyDelegate`, JSON.stringify(notification), {
                headers: this.headersForJson()
            })
            .map(this.extractData);
    }

    public createRelationship(relationship: IRelationshipAddDTO): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship`, JSON.stringify(relationship), {
                headers: this.headersForJson()
            })
            .map(this.extractData);
    }

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

}