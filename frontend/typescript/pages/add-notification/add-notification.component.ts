// import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES, FormControl, FormArray} from '@angular/forms';
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
    IRoleAttributeName,
    IRelationshipType,
    Relationship,
    IRelationshipAttribute, RelationshipAttribute
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
    public ospServices: IRoleAttributeName[];
    public declarationText: string;

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
                    this.declarationText = this.services.model.getRelationshipTypeAttributeNameUsage(ref, 'SUBJECT_RELATIONSHIP_TYPE_DECLARATION').defaultValue;
                    break;
                }
            }
        });

        // forms
        this.form = this._fb.group({
            abn: '',
            accepted: false,
            agencyServices: [[]],
            ssids: this._fb.array([this._fb.control('')])
        });

    }

    public back() {
        this.services.route.goToNotificationsPage(this.idValue);
    }

    public save() {

        this.clearGlobalMessages();

        let validationOk = true;
        let ssids = this.getSSIDs();
        const agencyServiceCodes = this.form.controls['agencyServices'].value;
        let accepted = this.form.controls['accepted'].value;

        if (!this.delegateIdentityRef) {
            validationOk = false;
            this.addGlobalMessage('Please select a software provider to link to.');
        } else {
            if (!this.accessPeriod.startDate) {
                validationOk = false;
                this.addGlobalMessage('Please specify a start date.');
            }
            if (!this.accessPeriod.endDate && !this.accessPeriod.noEndDate) {
                validationOk = false;
                this.addGlobalMessage('Please specify a end date.');
            }
            let notEmpty = (element: string) => {
                return element !== null && element !== undefined && element !== '';
            };
            if (!ssids || ssids.length === 0 || !ssids.every(notEmpty)) {
                validationOk = false;
                this.addGlobalMessage('Please specify valid software ids.');
            }
            if (!agencyServiceCodes || agencyServiceCodes.length === 0) {
                validationOk = false;
                this.addGlobalMessage('Please specify at least one agency service.');
            }
            if (!accepted) {
                validationOk = false;
                this.addGlobalMessage('Please accept the declaration.');
            }
        }

        if (validationOk && this.ospRelationshipTypeRef) {

            let attributes: IRelationshipAttribute[] = [];

            // ssid attribute
            attributes.push(new RelationshipAttribute(ssids,
                this.services.model.getRelationshipTypeAttributeNameRef(
                    this.ospRelationshipTypeRef, this.services.constants.RelationshipTypeAttributeCode.SSID)));

            // agency services
            attributes.push(new RelationshipAttribute(agencyServiceCodes,
                this.services.model.getRelationshipTypeAttributeNameRef(
                    this.ospRelationshipTypeRef, this.services.constants.RelationshipTypeAttributeCode.SELECTED_GOVERNMENT_SERVICES_LIST)));

            // build relationship
            let relationship = new Relationship(
                [],
                this.ospRelationshipTypeRef,
                new HrefValue(this.identity.party.href, null),
                null,
                this.delegateIdentityRef.value.party,
                null,
                this.accessPeriod.startDate,
                this.accessPeriod.endDate,
                null,
                null,
                attributes
            );

            // save relationship
            this.services.rest.createRelationship2(relationship).subscribe((role) => {
                this.back();
            }, (err) => {
                this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
            });

        }

    }

    // todo nev can you please return this string[]
    public getSSIDs(): string[] {
        return ['SSID12345'];
    }

    public resetDelegate() {
        console.log('AM AT RESET');
        this.delegateParty = null;
        this.delegateIdentityRef = null;
        (this.form.controls['abn'] as FormControl).updateValue('');
        (this.form.controls['agencyServices'] as FormControl).updateValue([]);
        (this.form.controls['accepted'] as FormControl).updateValue(false);
    }

    public findByABN() {
        const abn = this.form.controls['abn'].value;
        this.clearGlobalMessages();

        this.services.rest.findPartyByABN(abn).subscribe((party) => {

            // TODO check party has OSR role
            // set ospRoleRef ...
            // call model service getAccessibleAgencyServiceRoleAttributeNameUsages(roleTypeRef, empty programs) ...
            // set the array of agency services ...

            for (let identity of party.identities) {
                if (identity.value.rawIdValue === abn) {

                    // found business
                    // TODO iterate over pages
                    let page = 1;
                    this.services.rest.searchRolesByIdentity(identity.value.idValue, page).subscribe((results) => {

                        // check for OSP role
                        for (let role of results.list) {
                            // TODO is there a better way to match?
                            if (role.value.roleType.href.endsWith(this.services.constants.RelationshipTypeCode.OSP)) {
                                this.delegateParty = party;
                                this.ospRoleRef = role;
                                this.delegateIdentityRef = identity;
                                this.ospServices = this.services.model.getAccessibleAgencyServiceRoleAttributeNames(role, []);
                                return;
                            }
                        }

                        // no OSP role found
                        this.addGlobalMessages(['Cannot match ABN']);
                    });

                } else {
                    // no identity found
                    this.addGlobalMessages(['Cannot match ABN']);
                }
            }
        }, (err) => {
            this.addGlobalMessages(['Cannot match ABN']);
        });
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

    public addAnotherSSID() {
        const ssids = <FormArray>this.form.controls['ssids'];
        ssids.push(this._fb.control(''));
    }

    public removeSSID() {
        const ssids = <FormArray>this.form.controls['ssids'];
        ssids.removeAt(ssids.length - 1);
    }
}
