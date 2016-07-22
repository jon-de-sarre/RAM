import 'ng2-bootstrap';
import {Component} from '@angular/core';

import {RAMRestService} from '../../services/ram-rest.service';
import {RAMModelHelper} from '../../commons/ram-model-helper';
import {ErrorService} from '../error/error.service';

import {IIdentity} from '../../../../commons/RamAPI2';

@Component({
    selector: 'my-identity',
    templateUrl: 'my-identity.component.html'
})

/**
 * Simple placeholder for displaying the current user.
 * Demo code only.
 */
export class MyIdentityComponent {

    public me: IIdentity;

    constructor(private rest: RAMRestService,
                private errorService: ErrorService,
                private modelHelper: RAMModelHelper) {
    }

    public ngOnInit() {
        this.rest.findMyIdentity().subscribe(
            identity => {
                this.me = identity;
            }
        );
    }

}