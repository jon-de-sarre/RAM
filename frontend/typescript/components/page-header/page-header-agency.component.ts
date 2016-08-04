import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {RAMServices} from '../../services/ram-services';

@Component({
    selector: 'page-header',
    templateUrl: 'page-header-agency.component.html',
    directives: []
})

export class PageHeaderAgencyComponent {

    @Input() public tab: string;
    @Input() public messages: string[];

    constructor(private router: Router,
                private services: RAMServices) {
    }

    public title(): string {
        return 'Select Business ...';
    }

    public hasMessages(): boolean {
        return this.messages && this.messages.length > 0;
    }

}