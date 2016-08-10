// import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES, Validators, FormControl, FormArray} from '@angular/forms';
import {Calendar} from 'primeng/primeng';
import {AccessPeriodComponent, AccessPeriodComponentData} from '../../components/access-period/access-period.component';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {MarkdownComponent} from '../../components/ng2-markdown/ng2-markdown.component';
import {RAMServices} from '../../services/ram-services';
import {RAMNgValidators} from '../../commons/ram-ng-validators';

import {
    IIdentity,
    IParty,
    IHrefValue,
    HrefValue,
    IRole,
    IRoleAttributeName,
    IRelationshipType,
    Relationship,
    IRelationship,
    IRelationshipAttribute,
    RelationshipAttribute
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-osp-notification-add',
    templateUrl: 'edit-notification.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderSPSComponent,
        Calendar,
        AccessPeriodComponent,
        MarkdownComponent
    ]
})

export class EditNotificationComponent extends AbstractPageComponent {

    public identityHref: string;
    public relationshipHref: string;

    public delegateParty: IParty;
    public delegateIdentityRef: IHrefValue<IIdentity>;

    public accessPeriod: AccessPeriodComponentData = {
        startDate: new Date(),
        noEndDate: true,
        endDate: null
    };

    public identity: IIdentity;
    public relationship: IRelationship;
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

        // extract path and query parameters
        this.identityHref = params.path['identityHref'];
        this.relationshipHref = params.path['relationshipHref'];

        // forms
        this.form = this._fb.group({
            abn: [null, Validators.compose([Validators.required, RAMNgValidators.validateABNFormat])],
            accepted: false,
            agencyServices: [[]],
            ssids: this._fb.array([this._fb.control(null, Validators.required)])
        });

        // identity in focus
        this.services.rest.findIdentityByHref(this.identityHref).subscribe((identity) => {

            this.identity = identity;

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

            // relationship in focus
            if (this.relationshipHref) {
                this.services.rest.findRelationshipByHref(this.relationshipHref).subscribe((relationship) => {
                    this.relationship = relationship;
                    let delegate = relationship.delegate.value;
                    let abn = this.services.model.abnForParty(delegate);
                    (this.form.controls['abn'] as FormControl).updateValue(abn);
                    this.findByABN();
                    // todo, not yet implemented
                });
            }

        }, (err) => {
            const status = err.status;
            if (status === 401 || status === 403) {
                this.services.route.goToAccessDeniedPage();
            }
        });

    }

    public back() {
        this.services.route.goToNotificationsPage(this.identityHref);
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
                null,
                this.ospRelationshipTypeRef,
                new HrefValue(this.identity.party.href, null),
                null,
                this.delegateIdentityRef.value.party,
                null,
                this.accessPeriod.startDate,
                this.accessPeriod.endDate,
                null,
                null,
                this.services.constants.RelationshipInitiatedBy.DELEGATE,
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

    public resetDelegate() {
        this.delegateParty = null;
        this.delegateIdentityRef = null;
        (this.form.controls['abn'] as FormControl).updateValue('');
        (this.form.controls['agencyServices'] as FormControl).updateValue([]);
        (this.form.controls['accepted'] as FormControl).updateValue(false);
    }

    public findByABN() {
        const abn = this.form.controls['abn'].value.replace(/ /g, '');

        this.clearGlobalMessages();

        this.services.rest.findPartyByABN(abn).subscribe((party) => {

            // TODO check party has OSR role
            // set ospRoleRef ...
            // call model service getAccessibleAgencyServiceRoleAttributeNameUsages(roleTypeRef, empty programs) ...
            // set the array of agency services ...

            const searchRolesByIdentityAndPage = (href: string, identity:IHrefValue<IIdentity>, page: number) => {

                this.services.rest.searchRolesByHref(href, page).subscribe((results) => {

                    // check for OSP role
                    for (let role of results.list) {
                        // TODO is there a better way to match? also we need to check status?
                        if (role.value.roleType.href.endsWith(this.services.constants.RelationshipTypeCode.OSP)) {
                            this.delegateParty = party;
                            this.ospRoleRef = role;
                            this.delegateIdentityRef = identity;
                            this.ospServices = this.services.model.getAccessibleAgencyServiceRoleAttributeNames(role, []);
                            return;
                        }
                    }

                    const hasMore = (results.page * results.pageSize) < results.totalCount;
                    if (hasMore) {
                        searchRolesByIdentityAndPage(href, identity, page + 1);
                    } else {
                        // no OSP role found
                        this.addGlobalMessages(['The business matching the ABN is not a registered Online Service Provider']);
                    }

                });
            };

            for (let identity of party.identities) {
                if (identity.value.rawIdValue === abn) {
                    // found business
                    let href = this.services.model.getLinkHrefByType('role-list', identity.value._links);
                    searchRolesByIdentityAndPage(href, identity, 1);
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

    public getSSIDs(): string[] {
        return this.getSSIDFormArray().value;
    }

    public addAnotherSSID() {
        this.getSSIDFormArray().push(this._fb.control(null, Validators.required));
    }

    public removeSSID() {
        const ssids = this.getSSIDFormArray();
        ssids.removeAt(ssids.length - 1);
    }

    private getSSIDFormArray() {
        return this.form.controls['ssids'] as FormArray;
    }
}
