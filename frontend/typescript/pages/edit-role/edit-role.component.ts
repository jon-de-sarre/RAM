import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {RAMServices} from '../../services/ram-services';

import {
    IHrefValue,
    ISearchResult,
    IAgencyUser,
    IIdentity,
    Role,
    RoleAttribute,
    IRole,
    IRoleType,
    IRoleAttributeNameUsage,
    IAUSkey
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-edit-role',
    templateUrl: 'edit-role.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderAuthComponent
    ]
})

export class EditRoleComponent extends AbstractPageComponent {

    public idValue: string;
    public key: string;

    public roles$: Observable<ISearchResult<IHrefValue<IRole>>>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public me: IAgencyUser;
    public identity: IIdentity;
    public roleTypeRefs: IHrefValue<IRoleType>[];
    public agencyServiceRoleAttributeNameUsages: IRoleAttributeNameUsage[];
    public deviceAusKeys: IAUSkey[];

    public form: FormGroup;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices,
                private _fb: FormBuilder) {
        super(route, router, services);
        this.setBannerTitle('Authorisations');
    }

    public onInit(params: {path: Params, query: Params}) {

        // extract path and query parameters
        this.idValue = decodeURIComponent(params.path['idValue']);
        this.key = decodeURIComponent(params.path['key']);

        // forms
        this.form = this._fb.group({
            roleType: '-',
            preferredName: '',
            agencyServices: [[]],
            deviceAusKeys: [[]]
        });

        // me (agency user)
        this.services.rest.findMyAgencyUser().subscribe((me) => {
            this.me = me;
        }, (err) => {
            const status = err.status;
            if (status === 401 || status === 403) {
                this.services.route.goToAccessDeniedPage();
            }
        });

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // role types
        this.services.rest.listRoleTypes().subscribe((roleTypeRefs) => {
            this.roleTypeRefs = roleTypeRefs;
        });

        // device AUSkeys
        this.deviceAusKeys = [];
        this.services.rest.listAusKeys(this.idValue).subscribe((deviceAusKeys) => {
            this.deviceAusKeys.push(deviceAusKeys);
        });

        // TODO load existing role if we are editing one
        // TODO populate current form values if we are editing an existing role
    }

    public onRoleTypeChange(newRoleTypeCode: string) {
        if (this.me) {
            this.form.controls['agencyServices'].updateValueAndValidity([]);
            let roleTypeRef: IHrefValue<IRoleType> = this.services.model.getRoleTypeRef(this.roleTypeRefs, newRoleTypeCode);
            const programs: string[] = [];
            for (let programRole of this.me.programRoles) {
                if (programRole.role === 'ROLE_ADMIN') {
                    if (programs.indexOf(programRole.program) === -1) {
                        programs.push(programRole.program);
                    }
                }
            }
            if (roleTypeRef) {
                this.agencyServiceRoleAttributeNameUsages = this.services.model.getAccessibleAgencyServiceRoleAttributeNameUsages(roleTypeRef, programs);
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

    private toggleArrayValue(arr: string[], val: string) {
        let index = arr.indexOf(val);
        if (index === -1) {
            arr.push(val);
        } else {
            arr.splice(index, 1);
        }
    }

    public back() {
        this.services.route.goToRolesPage(this.idValue);
    }

    public save() {
        this.clearGlobalMessages();
        const roleTypeCode = this.form.controls['roleType'].value;
        const agencyServiceCodes = this.form.controls['agencyServices'].value;
        const preferredName = this.form.controls['preferredName'].value;
        const deviceAusKeys = this.form.controls['deviceAusKeys'].value;
        if (!roleTypeCode || roleTypeCode === '-') {
            this.addGlobalMessage('Please select a role type.');
        } else if (!this.agencyServiceRoleAttributeNameUsages || this.agencyServiceRoleAttributeNameUsages.length === 0) {
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
            this.services.rest.createRole(role).subscribe((role) => {
                this.services.route.goToRolesPage(this.idValue);
            }, (err) => {
                this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
            });
        }
    }

}
