import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {Validators, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {RAMNgValidators} from '../../commons/ram-ng-validators';
import {RAMServices} from '../../services/ram-services';

import {IIdentity, INotifyDelegateDTO} from '../../../../commons/RamAPI';

@Component({
    selector: 'add-relationship-complete',
    templateUrl: 'add-relationship-complete.component.html',
    directives: [ROUTER_DIRECTIVES, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, PageHeaderAuthComponent],
    providers: []
})

// todo display name shouldn't be sent through in the path, should be obtained from the details associated with the invitation code
export class AddRelationshipCompleteComponent extends AbstractPageComponent {

    public idValue: string;
    public code: string;
    public displayName: string;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;

    public form: FormGroup;
    public formUdn: FormGroup;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices,
                private _fb: FormBuilder) {
        super(route, router, services);
        this.setBannerTitle('Authorisations');
    }

    public onInit(params: {path: Params, query: Params}) {

        // extract path and query parameters
        this.idValue = params.path['idValue'];
        this.code = params.path['invitationCode'];
        this.displayName = params.path['displayName'];

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // forms
        this.form = this._fb.group({
            'email': ['', Validators.compose([Validators.required, RAMNgValidators.validateEmailFormat])]
        });
        this.formUdn = this._fb.group({
            'udn': ['']
        });
        // 'udn': ['', Validators.compose([Validators.required, RAMNgValidators.validateUDNFormat])]

    }

    public onSubmitUdn() {
        // TODO notify delegate by udn not implemented
        alert('Not Implemented');
        return false;
    }

    public onSubmitEmail() {
        const notifyDelegateDTO: INotifyDelegateDTO = {
            email: this.form.value.email
        };

        this.services.rest.notifyDelegateByInvitationCode(this.code, notifyDelegateDTO).subscribe((relationship) => {
            this.services.route.goToRelationshipsPage(this.idValue, null, 1, 'DELEGATE_NOTIFIED');
        }, (err) => {
            const status = err.status;
            if (status === 404) {
                this.addGlobalMessage('The code you have entered does not exist or is invalid.');
            } else {
                this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
            }
        });
        return false;
    };

    public goToRelationshipsPage() {
        this.services.route.goToRelationshipsPage(this.idValue);
    }
}
