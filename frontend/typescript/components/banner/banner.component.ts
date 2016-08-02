import 'ng2-bootstrap';
import {Component} from '@angular/core';

import {BannerService} from './banner.service';
import {TopMenuComponent} from '../top-menu/top-menu.component';

@Component({
    selector: 'page-banner',
    templateUrl: 'banner.component.html',
    directives: [TopMenuComponent]
})

export class BannerComponent {

    public title: String;

    constructor(private bannerService: BannerService) {
    }

    public ngOnInit() {
        this.title = 'Relationship Authorisation Manager';
        this.bannerService.subscribe((title: string) => {
            this.title = title;
        });
    }

}