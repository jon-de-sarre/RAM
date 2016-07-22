import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {RAMServices} from '../../services/ram-services';

import {IIdentity} from '../../../../commons/RamAPI2';

@Component({
    selector: 'page-header',
    templateUrl: 'page-header.component.html',
    directives: []
})

export class PageHeaderComponent {

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
        if (this.isLoginsPageEnabled()) {
            alert('TODO: MANAGE LOGINS');
        }
    };

    // todo roles page
    public goToRolesPage() {
        if (this.isRolesPageEnabled()) {
            alert('TODO: MANAGE ROLES');
        }
    };

    public isGiveAuthorisationsPageEnabled() {
        return this.giveAuthorisationsEnabled;
    }

    // todo logins page
    public isLoginsPageEnabled() {
        return false;
    }

    // todo roles page
    public isRolesPageEnabled() {
        return false;
    }

}