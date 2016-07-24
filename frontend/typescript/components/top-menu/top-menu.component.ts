import 'ng2-bootstrap';
import {Component} from '@angular/core';

import {RAMRestService} from '../../services/ram-rest.service';
import {RAMModelService} from '../../services/ram-model.service';
import {ErrorService} from '../error/error.service';

import {IIdentity} from '../../../../commons/RamAPI2';

@Component({
    selector: 'top-menu',
    templateUrl: 'top-menu.component.html'
})

export class TopMenuComponent {

    public me: IIdentity;

    constructor(private rest: RAMRestService,
                private errorService: ErrorService,
                private modelService: RAMModelService) {
    }

    public ngOnInit() {
        this.rest.findMyIdentity().subscribe(
            identity => {
                this.me = identity;
            }
        );
    }

    public isLoggedIn() {
        return this.me !== null && this.me !== undefined;
    }

}