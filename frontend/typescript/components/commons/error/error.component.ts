// TODO this component need to be deleted or migrated to project standards
import {Component, OnInit} from '@angular/core';

import {Error} from './error';
import {ErrorService} from './error.service';

@Component({
    selector: 'my-error',
    templateUrl: 'error.component.html',
    styles: [`
        .backdrop {
            background-color: rgba(0,0,0,0.6);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
        }
    `]
})

export class ErrorComponent implements OnInit {

    private errorDisplay = 'none';
    private errorData: Error;

    constructor(private errorService: ErrorService) {
    }

    public onErrorHandled() {
        this.errorDisplay = 'none';
    }

    public ngOnInit() {
        this.errorService.errorOccurred.subscribe((errorData: Error) => {
            this.errorData = errorData;
            this.errorDisplay = 'block';
        });
    }

}