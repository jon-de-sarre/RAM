import {RAMNgValidators} from '../../commons/ram-ng-validators';
import {OnInit, Component} from '@angular/core';
import {Validators, ControlGroup, FormBuilder, FORM_DIRECTIVES} from '@angular/common';
import {ROUTER_PROVIDERS, RouteParams} from '@angular/router-deprecated';

@Component({
    selector: 'add-relationship-complete',
    templateUrl: 'add-relationship-complete.component.html',
    directives: [FORM_DIRECTIVES],
    providers: [ROUTER_PROVIDERS]
})
export class AddRelationshipCompleteComponent implements OnInit {

    public form: ControlGroup;

    public data: { email?: String, udn?: String } = { email: 'test1', udn: 'test2' };

    public code: string;

    public idValue: string;

    constructor(private _fb: FormBuilder, private routeParams: RouteParams) {
    }

    public ngOnInit() {
                this.code = this.routeParams.get('invitationCode');
        this.idValue = this.routeParams.get('idValue');

        this.form = this._fb.group({
            'email': [this.data.email,
                Validators.compose([RAMNgValidators.validateEmailFormat])],
            'udn': [this.data.udn,
                Validators.compose([RAMNgValidators.validateUDNFormat])]
        });

    }
}