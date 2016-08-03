// import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';
import {Calendar} from 'primeng/primeng';
import {AccessPeriodComponent, AccessPeriodComponentData} from '../../components/access-period/access-period.component';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';

import {
    IIdentity,
    IParty,
    IHrefValue,
    HrefValue,
    IRole,
    IRelationshipType,
    Relationship,
    RelationshipAttribute,
    IRelationshipAttribute
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-osp-notification-add',
    templateUrl: 'add-notification.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent,
        Calendar,
        AccessPeriodComponent
    ]
})

export class AddNotificationComponent extends AbstractPageComponent {

    public idValue: string;
    public delegateParty: IParty;
    public delegateIdentityRef: IHrefValue<IIdentity>;

    public accessPeriod: AccessPeriodComponentData = {
        startDate: null,
        noEndDate: true,
        endDate: null
    };

    public identity: IIdentity;
    public ospRelationshipTypeRef: IHrefValue<IRelationshipType>;
    public ospRoleRef: IHrefValue<IRole>;

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

        // osp relationship type
        this.services.rest.listRelationshipTypes().subscribe((relationshipTypeRefs) => {
            for (let ref of relationshipTypeRefs) {
                if (ref.value.code === this.services.constants.RelationshipTypeCode.OSP) {
                    this.ospRelationshipTypeRef = ref;
                    break;
                }
            }
        });

        // forms
        this.form = this._fb.group({
            abn: '',
            accepted: false
        });

    }

    public back() {
        this.services.route.goToNotificationsPage(this.idValue);
    }

    // todo to be implemented
    public save() {
        this.clearGlobalMessages();
        if (!this.delegateIdentityRef) {
            this.addGlobalMessage('Please select a software provider to link to.');
        } else if (this.ospRelationshipTypeRef) {
            let attributes: IRelationshipAttribute[] = [];
            // todo set attributes
            let relationship = new Relationship(
                [],
                this.ospRelationshipTypeRef,
                new HrefValue(this.identity.party.href, null),
                null,
                this.delegateIdentityRef.value.party,
                null,
                new Date(),
                null,
                null,
                null,
                attributes
            );
            alert('TODO: Not yet implemented');
            console.log('relationship=' + relationship);
        }
    }

    public resetDelegate() {
        this.delegateParty = null;
        this.delegateIdentityRef = null;
    }

    public findByABN() {
        const abn = this.form.controls['abn'].value;
        this.clearGlobalMessages();

        this.services.rest.findPartyByABN(abn).subscribe((party) => {

            // TODO check party has OSR role
            // set ospRoleRef ...
            // call model service getAccessibleAgencyServiceRoleAttributeNameUsages(roleTypeRef, empty programs) ...
            // set the array of agency services ...

            this.delegateParty = party;
            for (let identity of party.identities) {
                if (identity.value.rawIdValue === abn) {
                    this.delegateIdentityRef = identity;
                    this.listServicesByIdValue(identity.value.idValue)
                }
            }
        }, (err) => {
            this.addGlobalMessages(['Cannot match ABN']);
        });
    }

    public listServicesByIdValue(idValue: string) {
        var page = 0;
        this.services.rest.searchRolesByIdentity(idValue, page).subscribe((party) => {

        });

    }
}
