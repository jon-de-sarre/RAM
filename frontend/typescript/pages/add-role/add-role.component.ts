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
            agencyServices: [[]]
        });

    }

    public onRoleTypeChange(newRoleTypeCode: string) {
        if (this.me) {
            let roleTypeRef: IHrefValue<IRoleType>;
            for (let ref of this.roleTypeRefs) {
                if (ref.value.code === newRoleTypeCode) {
                    roleTypeRef = ref;
                    break;
                }
            }
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
                console.log(JSON.stringify(this.agencyServiceRoleAttributeNameUsages, null, 4));
            }
        }
    }

    public onAgencyServiceChange(attributeCode: string) {
        console.log('Triggered:', attributeCode);
        let agencyServices = this.form.controls['agencyServices'].value;
        let index = agencyServices.indexOf(attributeCode);
        if (index === -1) {
            agencyServices.push(attributeCode);
        } else {
            agencyServices.splice(index, 1);
        }
    }

    public clickMe() {
        console.log('Role Type=', JSON.stringify(this.form.controls['roleType'].value, null, 4));
        console.log('Agency Services=', JSON.stringify(this.form.controls['agencyServices'].value, null, 4));
    }

}
