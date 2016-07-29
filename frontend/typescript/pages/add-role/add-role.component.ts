import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {RAMServices} from '../../services/ram-services';

import {
    IHrefValue,
    HrefValue,
    ISearchResult,
    IAgencyUser,
    IIdentity,
    Role,
    RoleAttribute,
    IRole,
    IRoleType,
    IRoleAttributeNameUsage
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-add-role',
    templateUrl: 'add-role.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderAuthComponent
    ]
})

export class AddRoleComponent extends AbstractPageComponent {

    public idValue: string;

    public roles$: Observable<ISearchResult<IHrefValue<IRole>>>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public me: IAgencyUser;
    public identity: IIdentity;
    public roleTypeRefs: IHrefValue<IRoleType>[];
    public agencyServiceRoleAttributeNameUsages: IRoleAttributeNameUsage[];

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

        // me (agency user)
        this.services.rest.findMyAgencyUser().subscribe((me) => {
            this.me = me;
        }, (err) => {
            const status = err.status;
            if (status === 401) {
                this.services.route.goToHomePage();
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

        // forms
        this.form = this._fb.group({
            roleType: '-',
            additionalNotes: '',
            agencyServices: [[]]
        });

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
        let agencyServices = this.form.controls['agencyServices'].value;
        let index = agencyServices.indexOf(attributeCode);
        if (index === -1) {
            agencyServices.push(attributeCode);
        } else {
            agencyServices.splice(index, 1);
        }
    }

    public back() {
        this.services.route.goToRolesPage(this.idValue);
    }

    public save() {
        this.clearGlobalMessages();
        const roleTypeCode = this.form.controls['roleType'].value;
        const agencyServiceCodes = this.form.controls['agencyServices'].value;
        const additionalNotes = this.form.controls['additionalNotes'].value;
        if (!roleTypeCode || roleTypeCode === '-') {
            this.addGlobalMessage('Please select a role type.');
        } else if (!this.agencyServiceRoleAttributeNameUsages || this.agencyServiceRoleAttributeNameUsages.length === 0) {
            this.addGlobalMessage('You do not have access to any government services.');
        } else if (agencyServiceCodes.length === 0) {
            this.addGlobalMessage('Please select at least one government agency service.');
        } else {
            let roleTypeRef: IHrefValue<IRoleType> = this.services.model.getRoleTypeRef(this.roleTypeRefs, roleTypeCode);
            let attributes: RoleAttribute[] = [];
            attributes.push(new RoleAttribute(additionalNotes, this.services.model.getRoleTypeAttributeNameRef(roleTypeRef, 'ADDITIONAL_NOTES')));
            for (let agencyServiceCode of agencyServiceCodes) {
                attributes.push(new RoleAttribute('true', this.services.model.getRoleTypeAttributeNameRef(roleTypeRef, agencyServiceCode)));
            }
            const role = new Role(
                [],
                roleTypeRef,
                new HrefValue('', this.identity) /* todo no real way of constructing the href */,
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
