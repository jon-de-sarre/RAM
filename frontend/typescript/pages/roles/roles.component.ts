import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {SearchResultPaginationComponent, SearchResultPaginationDelegate}
    from '../../components/search-result-pagination/search-result-pagination.component';
import {RAMServices} from '../../services/ram-services';

import {
    IHrefValue,
    ISearchResult,
    IAgencyUser,
    IIdentity,
    IRole,
    IRoleStatus,
    IRoleType
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-roles',
    templateUrl: 'roles.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderAuthComponent,
        SearchResultPaginationComponent
    ]
})

export class RolesComponent extends AbstractPageComponent {

    public idValue: string;
    public page: number;

    public roles$: Observable<ISearchResult<IHrefValue<IRole>>>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public agencyUser: IAgencyUser;
    public identity: IIdentity;
    public roleTypeRefs: IHrefValue<IRoleType>[];
    public roleStatusRefs: IHrefValue<IRoleStatus>[];

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

    public onInit(params: {path:Params, query:Params}) {

        // extract path and query parameters
        this.idValue = decodeURIComponent(params.path['idValue']);
        this.page = params.query['page'] ? +params.query['page'] : 1;

        // agency user
        this.services.rest.findMyAgencyUser().subscribe((me) => {
            this.agencyUser = me;
        });

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // role types
        this.services.rest.listRoleTypes().subscribe((roleTypeRefs) => {
            this.roleTypeRefs = roleTypeRefs;
        });

        // role statuses
        this.services.rest.listRoleStatuses().subscribe((roleStatusRefs) => {
            this.roleStatusRefs = roleStatusRefs;
        });

        // roles
        this.roles$ = this.services.rest.searchRolesByIdentity(this.idValue, this.page);
        this.roles$.subscribe((searchResult) => {
            this._isLoading = false;
        }, (err) => {
            this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
            this._isLoading = false;
        });

        // pagination delegate
        this.paginationDelegate = {
            goToPage: (page: number) => {
                this.services.route.goToRolesPage(this.idValue, page);
            }
        } as SearchResultPaginationDelegate;

        // forms
        this.form = this._fb.group({
        });

    }

    public get isLoading() {
        return this._isLoading;
    }

    public goToAddRolePage() {
        if (this.agencyUser) {
            this.services.route.goToAddRolePage(this.idValue);
        }
    }

    // todo not yet implemented
    public goToRolePage(rolRef: IHrefValue<IRole>) {
        alert('TODO: Not yet implemented');
    }

    public isAddRoleEnabled() {
        return this.agencyUser !== null && this.agencyUser !== undefined;
    }

}
