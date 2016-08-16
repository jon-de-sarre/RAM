import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES, FormControl} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {
    SearchResultPaginationComponent, SearchResultPaginationDelegate
}
    from '../../components/search-result-pagination/search-result-pagination.component';
import {RAMConstants} from '../../services/ram-constants.service';
import {RAMServices} from '../../services/ram-services';

import {
    IHrefValue,
    FilterParams,
    ISearchResult,
    IPrincipal,
    IIdentity,
    Role,
    RoleAttribute,
    IRole,
    IRoleType,
    IRoleAttributeNameUsage,
    IAUSkey,
    IRoleAttribute
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-edit-role',
    templateUrl: 'edit-role.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderAuthComponent,
        SearchResultPaginationComponent
    ]
})

export class EditRoleComponent extends AbstractPageComponent {

    public identityHref: string;
    public roleHref: string;

    public auskeyFilter: FilterParams;
    public auskeyPage: number;
    public auskeyPaginationDelegate: SearchResultPaginationDelegate;

    public deviceAusKeyRefs: ISearchResult<IHrefValue<IAUSkey>>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public me: IPrincipal;
    public identity: IIdentity;
    public role: IRole;
    public roleTypeRefs: IHrefValue<IRoleType>[];
    public allAgencyServiceRoleAttributeNameUsages: IRoleAttributeNameUsage[]; // all agency services
    public accessibleAgencyServiceRoleAttributeNameUsages: IRoleAttributeNameUsage[]; // agency services that the user can manage
    public assignedAgencyAttributes: IRoleAttribute[]; // agency services assigned to the role
    public form: FormGroup;

    private _isLoading = false; // set to true when you want the UI indicate something is getting loaded.

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Authorisations');
    }

    public onInit(params: {path: Params, query: Params}) {

        // extract path and query parameters
        this.identityHref = params.path['identityHref'];
        this.roleHref = params.path['roleHref'];

        this.auskeyFilter = FilterParams.decode(params.query['auskeyFilter']);
        this.auskeyPage = params.query['auskeyPage'] ? +params.query['auskeyPage'] : 1;

        // restrict to device auskeys
        this.auskeyFilter.add('auskeyType', RAMConstants.AUSkey.DEVICE_TYPE);

        this._isLoading = true;

        // forms
        this.form = this.fb.group({
            roleType: '-',
            preferredName: '',
            agencyServices: [[]],
            deviceAusKeys: [[]],
            toggleAllAuskeys: false
        });

        // extract path and query parameters
        this.identityHref = params.path['identityHref'];
        this.roleHref = params.path['roleHref'];

        this.auskeyFilter = FilterParams.decode(params.query['auskeyFilter']);
        this.auskeyPage = params.query['auskeyPage'] ? +params.query['auskeyPage'] : 1;

        // restrict to device auskeys
        this.auskeyFilter.add('auskeyType', RAMConstants.AUSkey.DEVICE_TYPE);

        // me (agency user)
        this.services.rest.findMyPrincipal().subscribe({
            next: this.onFindMe.bind(this),
            error: this.onServerError.bind(this)
        });

        // identity in focus
        this.services.rest.findIdentityByHref(this.identityHref).subscribe({
            next: this.onFindIdentity.bind(this),
            error: this.onServerError.bind(this)
        });

        // role types
        this.services.rest.listRoleTypes().subscribe({
            next: (roleTypeRefs) => this.roleTypeRefs = roleTypeRefs,
            error: this.onServerError.bind(this)
        });
    }

    public onFindIdentity(identity: IIdentity) {

        this.identity = identity;

        // pagination delegate
        this.auskeyPaginationDelegate = {
            goToPage: (page: number) => {
                let href = this.services.model.getLinkHrefByType('auskey-list', this.identity);
                this.services.rest.searchAusKeysByHref(href, this.auskeyFilter.encode(), page).subscribe({
                    next: (auskeys) => this.deviceAusKeyRefs = auskeys,
                    error: this.onServerError.bind(this)
                });
            }
        } as SearchResultPaginationDelegate;

        this.auskeyPaginationDelegate.goToPage(1);

        // role in focus
        if (this.roleHref) {
            this.services.rest.findRoleByHref(this.roleHref).subscribe({
                next: this.onFindRole.bind(this),
                error: this.onServerError.bind(this)
            });
        }
    }

    private onFindRole(role: IRole) {

        this.role = role;

        if (!this.services.model.hasLinkHrefByType(RAMConstants.Link.MODIFY, this.role)) {
            // no modify access
            this.services.route.goToAccessDeniedPage();
        } else {

            // load relationship type
            this.services.rest.findRoleTypeByHref(role.roleType.href).subscribe({
                next: (roleType) => {
                    (this.form.controls['roleType'] as FormControl).updateValue(roleType.code);
                    this.role.roleType.value = roleType;
                    this.onRoleTypeChange(roleType.code);
                },
                error: this.onServerError.bind(this)
            });

            const preferredName = this.services.model.getRoleAttributeValue(this.services.model.getRoleAttribute(role, 'PREFERRED_NAME', 'OTHER'));
            const deviceAusKeys = this.services.model.getRoleAttributeValue(this.services.model.getRoleAttribute(role, 'DEVICE_AUSKEYS', 'OTHER'));

            (this.form.controls['preferredName'] as FormControl).updateValue(preferredName);
            (this.form.controls['deviceAusKeys'] as FormControl).updateValue(deviceAusKeys);

            this.assignedAgencyAttributes = this.services.model.getRoleAttributesByClassifier(role, 'AGENCY_SERVICE');
            for (let attr of this.assignedAgencyAttributes) {
                if (attr.value[0] === 'true') {
                    this.onAgencyServiceChange(attr.attributeName.value.code);
                }
            }

        }

    }

    private onFindMe(me: IPrincipal) {
        this.me = me;
    }

    public onRoleTypeChange(newRoleTypeCode: string) {
        if (this.me) {
            this.form.controls['agencyServices'].updateValueAndValidity([]);
            let roleTypeRef: IHrefValue<IRoleType> = this.services.model.getRoleTypeRef(this.roleTypeRefs, newRoleTypeCode);
            const programs: string[] = [];

            if(this.me.agencyUserInd) {
                // agency users can select program roles
                for (let programRole of this.me.agencyUser.programRoles) {
                    if (programRole.role === 'ROLE_ADMIN') {
                        if (programs.indexOf(programRole.program) === -1) {
                            programs.push(programRole.program);
                        }
                    }
                }
            } else {
                // standard users can see program roles assigned

            }




            if (roleTypeRef) {
                this.allAgencyServiceRoleAttributeNameUsages = this.services.model.getAllAgencyServiceRoleAttributeNameUsages(roleTypeRef, programs);
                this.accessibleAgencyServiceRoleAttributeNameUsages = this.services.model.getAccessibleAgencyServiceRoleAttributeNameUsages(roleTypeRef, programs);
            }
        }
    }

    public onAgencyServiceChange(attributeCode: string) {
        this.toggleArrayValue(this.form.controls['agencyServices'].value, attributeCode);
    }

    public onAusKeyChange(auskey: string) {
        this.toggleArrayValue(this.form.controls['deviceAusKeys'].value, auskey);
    }

    public isAusKeySelected(auskey: string) {
        return this.form.controls['deviceAusKeys'].value.indexOf(auskey) > -1;
    }

    public isAgencyServiceSelected(code: string) {
        return this.form.controls['agencyServices'].value.indexOf(code) > -1;
    }

    public hasAccessToAgencyService(code: string) {
        for(let attr of this.accessibleAgencyServiceRoleAttributeNameUsages) {
            if(attr.attributeNameDef.value.code === code) {
                return true;
            }
        }
        return false;
    }

    public toggleAllAuskeys() {
        if (this.form.controls['toggleAllAuskeys'].value) {
            // toggle off
            const arr = this.form.controls['deviceAusKeys'].value;
            for (let val of this.deviceAusKeyRefs.list) {
                let index = arr.indexOf(val.value.id);
                if (index > -1) {
                    arr.splice(index, 1);
                }
            }
        } else {
            // toggle on
            const arr = this.form.controls['deviceAusKeys'].value;
            for (let val of this.deviceAusKeyRefs.list) {
                let index = arr.indexOf(val.value.id);
                if (index === -1) {
                    arr.push(val.value.id);
                }
            }
        }
    }

    private toggleArrayValue(arr: string[], val: string) {
        let index = arr.indexOf(val);
        if (index === -1) {
            arr.push(val);
        } else {
            arr.splice(index, 1);
        }
    }

    public back() {
        this.services.route.goToRolesPage(this.identityHref);
    }

    public save() {
        this.clearGlobalMessages();
        const roleTypeCode = this.form.controls['roleType'].value;
        const agencyServiceCodes = this.form.controls['agencyServices'].value;
        const preferredName = this.form.controls['preferredName'].value;
        const deviceAusKeys = this.form.controls['deviceAusKeys'].value;
        if (!roleTypeCode || roleTypeCode === '-') {
            this.addGlobalMessage('Please select a role type.');
        } else if (!this.accessibleAgencyServiceRoleAttributeNameUsages || this.accessibleAgencyServiceRoleAttributeNameUsages.length === 0) {
            this.addGlobalMessage('You do not have access to any government services.');
        } else if (agencyServiceCodes.length === 0) {
            this.addGlobalMessage('Please select at least one government agency service.');
        } else {
            let roleTypeRef: IHrefValue<IRoleType> = this.services.model.getRoleTypeRef(this.roleTypeRefs, roleTypeCode);
            let attributes: RoleAttribute[] = [];
            attributes.push(new RoleAttribute(preferredName, this.services.model.getRoleTypeAttributeNameRef(roleTypeRef, 'PREFERRED_NAME')));
            attributes.push(new RoleAttribute(deviceAusKeys, this.services.model.getRoleTypeAttributeNameRef(roleTypeRef, 'DEVICE_AUSKEYS')));
            for (let agencyServiceCode of agencyServiceCodes) {
                attributes.push(new RoleAttribute('true', this.services.model.getRoleTypeAttributeNameRef(roleTypeRef, agencyServiceCode)));
            }
            const role = new Role(
                [],
                null,
                roleTypeRef,
                this.identity.party,
                new Date(),
                null,
                null,
                new Date(),
                'ACTIVE',
                attributes
            );
            // todo replace with href
            this.services.rest.createRole(role).subscribe((role) => {
                this.services.route.goToRolesPage(this.identityHref);
            }, (err) => {
                this.addGlobalErrorMessages(err);
            });
        }
    }

}
