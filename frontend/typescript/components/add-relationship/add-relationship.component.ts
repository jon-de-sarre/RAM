import Rx from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {BannerService} from '../commons/banner/banner.service';
import {PageHeaderComponent} from '../commons/page-header/page-header.component';
import {RAMRestService} from '../../services/ram-rest.service';
import {RAMModelHelper} from '../../commons/ram-model-helper';
import {RAMRouteHelper} from '../../commons/ram-route-helper';

import {AccessPeriodComponent, AccessPeriodComponentData} from '../commons/access-period/access-period.component';
import {AuthorisationPermissionsComponent} from '../commons/authorisation-permissions/authorisation-permissions.component';
import {
    AuthorisationTypeComponent,
    AuthorisationTypeComponentData
} from '../commons/authorisation-type/authorisation-type.component';
import {
    RelationshipDeclarationComponent, DeclarationComponentData
} from '../commons/relationship-declaration/relationship-declaration.component';
import {
    RepresentativeDetailsComponent, RepresentativeDetailsComponentData
} from
'../commons/representative-details/representative-details.component';
import {
    AuthorisationManagementComponent,
    AuthorisationManagementComponentData
} from '../commons/authorisation-management/authorisation-management.component';

import {
    IAttributeDTO,
    IIdentity,
    ICreateIdentityDTO,
    IRelationshipAddDTO,
    IRelationshipAttributeNameUsage,
    IRelationshipType,
    IHrefValue
} from '../../../../commons/RamAPI2';

@Component({
    selector: 'add-relationship',
    templateUrl: 'add-relationship.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        AccessPeriodComponent,
        AuthorisationPermissionsComponent,
        AuthorisationTypeComponent,
        RelationshipDeclarationComponent,
        RepresentativeDetailsComponent,
        AuthorisationManagementComponent,
        PageHeaderComponent
    ]
})

export class AddRelationshipComponent extends AbstractPageComponent {

    public idValue: string;

    public relationshipTypes$: Rx.Observable<IHrefValue<IRelationshipType>[]>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;
    public manageAuthAttribute: IRelationshipAttributeNameUsage;

    public newRelationship: AddRelationshipComponentData = {
        accessPeriod: {
            startDate: null,
            noEndDate: true,
            endDate: null
        },
        authType: {
            authType: 'choose'
        },
        representativeDetails: {
            individual: {
                givenName: '',
                familyName: null,
                dob: null
            },
            organisation: {
                abn: ''
            }
        },
        authorisationManagement: {
            value: ''
        },
        decalaration: {
            accepted: false
        }
    };

    constructor(route: ActivatedRoute,
                router: Router,
                rest: RAMRestService,
                modelHelper: RAMModelHelper,
                routeHelper: RAMRouteHelper,
                bannerService: BannerService) {
        super(route, router, rest, modelHelper, routeHelper, bannerService);
        this.setTitle('Authorisations');
    }

    public onInit(params: {path: Params, query: Params}) {

        this.idValue = decodeURIComponent(params.path['idValue']);

        // identity in focus
        this.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // relationship types
        this.relationshipTypes$ = this.rest.listRelationshipTypes();

        // delegate managed attribute
        this.resolveManageAuthAttribute('UNIVERSAL_REPRESENTATIVE', 'DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND');

    }

    public back = () => {
        this.router.navigate(['/relationships', encodeURIComponent(this.idValue)]);
    };

    /* tslint:disable:max-func-body-length */
    public submit = () => {

        let delegate: ICreateIdentityDTO;

        if (this.newRelationship.representativeDetails.individual) {
            const dob = this.newRelationship.representativeDetails.individual.dob;
            delegate = {
                partyType: 'INDIVIDUAL',
                givenName: this.newRelationship.representativeDetails.individual.givenName,
                familyName: this.newRelationship.representativeDetails.individual.familyName,
                sharedSecretTypeCode: 'DATE_OF_BIRTH', // TODO: set to date of birth code
                sharedSecretValue: dob ? dob.toString() : ' ' /* TODO check format of date, currently sending x for space */,
                identityType: 'INVITATION_CODE',
                agencyScheme: undefined,
                agencyToken: undefined,
                linkIdScheme: undefined,
                linkIdConsumer: undefined,
                publicIdentifierScheme: undefined,
                profileProvider: undefined,
            };
        } else {
            /* TODO handle organisation delegate */
            alert('NOT YET IMPLEMENTED!');
            //delegate = {
            //    partyType: 'ABN',
            //    unstructuredName: '' ,
            //    identityType: 'PUBLIC_IDENTIFIER',
            //    publicIdentifierScheme: 'ABN',
            //    agencyToken: this.newRelationship.representativeDetails.organisation.abn // // TODO: where does the ABN value go?
            //};
        }

        const authorisationManagement: IAttributeDTO = {
            code: 'DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND',
            value: this.newRelationship.authorisationManagement.value
        };

        const relationship: IRelationshipAddDTO = {
            relationshipType: this.newRelationship.authType.authType,
            subjectIdValue: this.idValue,
            delegate: delegate,
            startTimestamp: this.newRelationship.accessPeriod.startDate,
            endTimestamp: this.newRelationship.accessPeriod.endDate,
            attributes: [
                authorisationManagement
            ] /* TODO setting the attributes */
        };

        this.rest.createRelationship(relationship).subscribe((relationship) => {
            //console.log(JSON.stringify(relationship, null, 4));
            this.rest.findIdentityByHref(relationship.delegate.value.identities[0].href).subscribe((identity) => {
                //console.log(JSON.stringify(identity, null, 4));
                this.routeHelper.goToRelationshipAddCompletePage(
                    this.idValue,
                    identity.rawIdValue,
                    this.displayName(this.newRelationship.representativeDetails));
            }, (err) => {
                this.addGlobalMessages(this.rest.extractErrorMessages(err));
            });
        }, (err) => {
            this.addGlobalMessages(this.rest.extractErrorMessages(err));
        });

    };

    public resolveManageAuthAttribute(relationshipTypeCode: string, attributeNameCode: string) {
        this.relationshipTypes$
            .subscribe(relationshipTypeHrefValues => {
                // find the relationship type
                const relationshipTypeHrefValue = relationshipTypeHrefValues.filter((relationshipTypeHrefValue) => {
                    return relationshipTypeHrefValue.value.code === relationshipTypeCode;
                });

                // find the attribute name
                let manageAuthAttributes = relationshipTypeHrefValue[0].value.relationshipAttributeNames
                    .filter((attributeName) => attributeName.attributeNameDef.value.code === attributeNameCode);
                if (manageAuthAttributes.length === 1) {
                    this.manageAuthAttribute = manageAuthAttributes[0];
                }
            });
    }

    public displayName(repDetails: RepresentativeDetailsComponentData) {
        if (repDetails.organisation) {
            return repDetails.organisation.abn;
        } else {
            return repDetails.individual.givenName + (repDetails.individual.familyName ? ' ' + repDetails.individual.familyName : '');
        }
    }

}

export interface AddRelationshipComponentData {
    accessPeriod: AccessPeriodComponentData;
    authType: AuthorisationTypeComponentData;
    representativeDetails: RepresentativeDetailsComponentData;
    authorisationManagement: AuthorisationManagementComponentData;
    decalaration: DeclarationComponentData;
}