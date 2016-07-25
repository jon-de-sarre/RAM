import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {RAMServices} from '../../services/ram-services';

import {IIdentity} from '../../../../commons/RamAPI2';

@Component({
    selector: 'page-header',
    templateUrl: 'page-header-sps.component.html',
    directives: []
})

export class PageHeaderSPSComponent {

    @Input() public identity: IIdentity;
    @Input() public tab: string;
    @Input() public messages: string[];
    @Input() public giveAuthorisationsEnabled: boolean = false;

    constructor(private router: Router,
                private services: RAMServices) {
    }

    public title(): string {
        return this.identity ? this.services.model.displayNameForIdentity(this.identity) : 'Select Business ...';
    }

    public hasMessages(): boolean {
        return this.messages && this.messages.length > 0;
    }

    public goToNotificationsPage() {
        if (this.isIdentityValid()) {
            this.services.route.goToNotificationsPage(this.identity.idValue);
        }
    };

    public goToAddNotificationPage() {
        if (this.isAddNotificationPageEnabled()) {
            this.services.route.goToAddNotificationPage(this.identity.idValue);
        }
    };

    // todo do we need to check access permissions?
    public isAddNotificationPageEnabled() {
        return this.isIdentityValid();
    }

    private isIdentityValid() {
        return this.identity !== null && this.identity !== undefined;
    }

}