// TODO this component need to be deleted or migrated to project standards
import {EventEmitter} from '@angular/core';
import {Response} from '@angular/http';
import {Error} from './error';

export class ErrorService {

    public errorOccurred = new EventEmitter<Error>();

    public handleError(response: Response) {
        this.errorOccurred.emit(Error.fromResponse(response));
    }

}