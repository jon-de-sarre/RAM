import 'ng2-bootstrap';
import {Component} from '@angular/core';

import {BannerService} from './banner.service';
import {MyIdentityComponent} from '../my-identity/my-identity.component';

@Component({
    selector: 'page-banner',
    templateUrl: 'banner.component.html',
    directives: [MyIdentityComponent]
})

export class BannerComponent {

    public title: String;

    constructor(private bannerService: BannerService) {
    }

    public ngOnInit() {
        this.title = 'Relationship Access Manager';
        this.bannerService.subscribe((title: string) => {
            this.title = title;
        });
    }

}