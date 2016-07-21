import 'ng2-bootstrap';
import {Component} from '@angular/core';

import {MyIdentityComponent} from '../my-identity/my-identity.component';

@Component({
    selector: 'page-banner',
    templateUrl: 'banner.component.html',
    directives: [MyIdentityComponent]
})

export class BannerComponent {

    public title: String;

    constructor() {
        // todo
    }

    public ngOnInit() {
        // todo
        this.title = 'Authorisations';
    }

}