import {Observable} from 'rxjs/Observable';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {Dialog} from 'primeng/primeng';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {MarkdownComponent} from '../../components/ng2-markdown/ng2-markdown.component';
import {RAMServices} from '../../services/ram-services';
import {RAMConstants} from '../../services/ram-constants.service';

import {
    IIdentity,
    IRelationship,
    IRelationshipType,
    IRelationshipAttribute,
    IRelationshipAttributeNameUsage
} from '../../../../commons/RamAPI';

@Component({
    selector: 'accept-authorisation',
    templateUrl: 'accept-authorisation.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderAuthComponent, MarkdownComponent, Dialog]
})

export class AcceptAuthorisationComponent extends AbstractPageComponent {

    public idValue: string;
    public code: string;

    public relationship$: Observable<IRelationship>;
    public relationshipType$: Observable<IRelationshipType>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;
    public relationship: IRelationship;
    public delegateManageAuthorisationAllowedIndAttribute: IRelationshipAttribute;
    public delegateRelationshipTypeDeclarationAttributeUsage: IRelationshipAttributeNameUsage;

    public declineDisplay: boolean = false;

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Authorisations');
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        // extract path and query parameters
        this.idValue = params.path['idValue'];
        this.code = params.path['invitationCode'];

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // relationship
        this.relationship$ = this.services.rest.findPendingRelationshipByInvitationCode(this.code);
        this.relationship$.subscribe((relationship) => {
            this.relationship = relationship;
            for (let attribute of relationship.attributes) {
                if (attribute.attributeName.value.code === 'DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND') {
                    this.delegateManageAuthorisationAllowedIndAttribute = attribute;
                }
            }
            this.relationshipType$ = this.services.rest.findRelationshipTypeByHref(relationship.relationshipType.href);
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
                this.addGlobalErrorMessages(err);
            }
        });

    }

    public showDeclineConfirmation = () => {
        this.declineDisplay = true;
    };

    public cancelDeclineConfirmation = () => {
        this.declineDisplay = false;
    };

    public confirmDeclineAuthorisation = () => {
        this.services.rest.rejectPendingRelationshipByInvitationCode(this.relationship).subscribe(() => {
            this.declineDisplay = false;
            this.services.route.goToRelationshipsPage(this.idValue, null, 1, RAMConstants.GlobalMessage.DECLINED_RELATIONSHIP);
        }, (err) => {
            this.declineDisplay = false;
            this.addGlobalErrorMessages(err);
        });
    };

    public acceptAuthorisation = () => {
        this.services.rest.acceptPendingRelationshipByInvitationCode(this.relationship).subscribe(() => {
            this.services.route.goToRelationshipsPage(this.idValue, null, 1, RAMConstants.GlobalMessage.ACCEPTED_RELATIONSHIP);
        }, (err) => {
            this.addGlobalErrorMessages(err);
        });
    };

    public goToEnterAuthorisationPage = () => {
        this.services.route.goToRelationshipEnterCodePage(this.idValue, RAMConstants.GlobalMessage.INVALID_CODE);
    };

    public goToRelationshipsPage = () => {
        this.services.route.goToRelationshipsPage(this.idValue, null, 1, RAMConstants.GlobalMessage.CANCEL_ACCEPT_RELATIONSHIP);
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