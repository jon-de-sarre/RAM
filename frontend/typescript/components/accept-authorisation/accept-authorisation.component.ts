import Rx from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {DatePipe} from '@angular/common';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderComponent} from '../commons/page-header/page-header.component';
import {RAMServices} from '../../commons/ram-services';

import {
    IIdentity,
    IRelationship,
    IRelationshipType,
    IRelationshipAttribute,
    IRelationshipAttributeNameUsage
} from '../../../../commons/RamAPI2';

@Component({
    selector: 'accept-authorisation',
    templateUrl: 'accept-authorisation.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderComponent]
})

export class AcceptAuthorisationComponent extends AbstractPageComponent {

    public idValue: string;
    public code: string;

    public relationship$: Rx.Observable<IRelationship>;
    public relationshipType$: Rx.Observable<IRelationshipType>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;
    public relationship: IRelationship;
    public delegateManageAuthorisationAllowedIndAttribute: IRelationshipAttribute;
    public delegateRelationshipTypeDeclarationAttributeUsage: IRelationshipAttributeNameUsage;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setTitle('Authorisations');
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        // extract path and query parameters
        this.idValue = decodeURIComponent(params.path['idValue']);
        this.code = decodeURIComponent(params.path['invitationCode']);

        // identity in focus
        this.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // relationship
        this.relationship$ = this.rest.findPendingRelationshipByInvitationCode(this.code);
        this.relationship$.subscribe((relationship) => {
            this.relationship = relationship;
            for (let attribute of relationship.attributes) {
                if (attribute.attributeName.value.code === 'DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND') {
                    this.delegateManageAuthorisationAllowedIndAttribute = attribute;
                }
            }
            this.relationshipType$ = this.rest.findRelationshipTypeByHref(relationship.relationshipType.href);
            this.relationshipType$.subscribe((relationshipType) => {
                for (let attributeUsage of relationshipType.relationshipAttributeNames) {
                    if (attributeUsage.attributeNameDef.value.code === 'DELEGATE_RELATIONSHIP_TYPE_DECLARATION') {
                        this.delegateRelationshipTypeDeclarationAttributeUsage = attributeUsage;
                    }
                }
            });
        }, (err) => {
            if (err.status === 404) {
                this.goToEnterAuthorisationPage();
            } else {
                this.addGlobalMessages(this.rest.extractErrorMessages(err));
            }
        });

    }

    public declineAuthorisation = () => {
        this.rest.rejectPendingRelationshipByInvitationCode(this.relationship).subscribe(() => {
            this.routeHelper.goToRelationshipsPage(this.idValue, null, 1, 'DECLINED_RELATIONSHIP');
        }, (err) => {
            this.addGlobalMessages(this.rest.extractErrorMessages(err));
        });
    };

    public acceptAuthorisation = () => {
        this.rest.acceptPendingRelationshipByInvitationCode(this.relationship).subscribe(() => {
            this.routeHelper.goToRelationshipsPage(this.idValue, null, 1, 'ACCEPTED_RELATIONSHIP');
        }, (err) => {
            this.addGlobalMessages(this.rest.extractErrorMessages(err));
        });
    };

    public goToEnterAuthorisationPage = () => {
        this.routeHelper.goToRelationshipEnterCodePage(this.idValue, 'INVALID_CODE');
    };

    public goToRelationshipsPage = () => {
        this.routeHelper.goToRelationshipsPage(this.idValue, null, 1, 'CANCEL_ACCEPT_RELATIONSHIP');
    };

    // TODO: not sure how to set the locale, Implement as a pipe
    public displayDate(dateString: string) {
        if (dateString) {
            const date = new Date(dateString);
            const datePipe = new DatePipe();
            return datePipe.transform(date, 'd') + ' ' +
                datePipe.transform(date, 'MMMM') + ' ' +
                datePipe.transform(date, 'yyyy');
        }
        return 'Not specified';
    }

}