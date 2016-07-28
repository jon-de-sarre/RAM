import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {RAMServices} from '../../services/ram-services';

import {IIdentity} from '../../../../commons/RamAPI';

@Component({
    selector: 'page-header',
    templateUrl: 'page-header-auth.component.html',
    directives: []
})

export class PageHeaderAuthComponent {

    @Input() public identity: IIdentity;
    @Input() public tab: string;
    @Input() public messages: string[];
    @Input() public giveAuthorisationsEnabled: boolean = false;

    constructor(private router: Router,
                private services: RAMServices) {
    }

    public hasMessages(): boolean {
        return this.messages && this.messages.length > 0;
    }

    public title(): string {
        return this.identity ? this.services.model.displayNameForIdentity(this.identity) : 'Loading ...';
    }

    public goToRelationshipsPage() {
        if (this.identity) {
            this.services.route.goToRelationshipsPage(this.identity.idValue);
        }
    };

    public goToGiveAuthorisationPage() {
        if (this.isGiveAuthorisationsPageEnabled()) {
            if (this.identity) {
                this.services.route.goToRelationshipAddPage(this.identity.idValue);
            }
        }
    };

    public goToGetAuthorisationPage() {
        if (this.identity) {
            this.services.route.goToRelationshipEnterCodePage(this.identity.idValue);
        }
    };

    // todo logins page
    public goToLoginsPage() {
        if (this.identity) {
            if (this.isLoginsPageEnabled()) {
                alert('TODO: MANAGE LOGINS');
            }
        }
    };

    public goToRolesPage() {
        if (this.identity) {
            if (this.isRolesPageEnabled()) {
                this.services.route.goToRolesPage(this.identity.idValue);
            }
        }
    };

    public goToAddRolePage() {
        if (this.identity) {
            if (this.isAddRolePageEnabled()) {
                this.services.route.goToAddRolePage(this.identity.idValue);
            }
        }
    };

    public isGiveAuthorisationsPageEnabled() {
        return this.identity !== null && this.identity !== undefined && this.giveAuthorisationsEnabled;
    }

    // todo logins page
    public isLoginsPageEnabled() {
        return false;
    }

    // todo verify logic
    public isRolesPageEnabled() {
        return this.identity !== null &&
            this.identity !== undefined &&
            !this.services.model.isIndividual(this.identity);
    }

    // todo verify logic
    public isAddRolePageEnabled() {
        return this.identity !== null &&
            this.identity !== undefined &&
            !this.services.model.isIndividual(this.identity);
    }

}