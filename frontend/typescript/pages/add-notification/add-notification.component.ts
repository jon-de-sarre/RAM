// import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';

import {
    IIdentity,
    IParty,
    IHrefValue
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-osp-notification-add',
    templateUrl: 'add-notification.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent
    ]
})

export class AddNotificationComponent extends AbstractPageComponent {

    public idValue: string;
    public delegateParty: IParty;
    public delegateIdentityRef: IHrefValue<IIdentity>;

    public identity: IIdentity;

    public form: FormGroup;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices,
                private _fb: FormBuilder) {
        super(route, router, services);
        this.setBannerTitle('Software Provider Services');
    }

    public onInit(params: {path: Params, query: Params}) {

        this.idValue = decodeURIComponent(params.path['idValue']);

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // forms
        this.form = this._fb.group({
            abn: ''
        });
    }

    public back() {
        this.services.route.goToNotificationsPage(this.idValue);
    }

    // todo to be implemented
    public save() {
        this.clearGlobalMessages();
        alert('TODO: Not yet implemented');
    }

    public resetDelegate() {
        this.delegateParty = null;
        this.delegateIdentityRef = null;
    }

    public findByABN() {
        const abn = this.form.controls['abn'].value;
        this.clearGlobalMessages();

        this.services.rest.findPartyByABN(abn).subscribe((party) => {
            this.delegateParty = party;
            for (let identity of party.identities) {
                if (identity.value.rawIdValue === abn) {
                    this.delegateIdentityRef = identity;
                }
            }
        }, (err) => {
            this.addGlobalMessages(['Cannot match ABN']);
        });
    }
}
