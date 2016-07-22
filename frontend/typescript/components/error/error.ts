// TODO this component need to be deleted or migrated to project standards
import {Response} from '@angular/http';

export class Error {

    public static fromResponse(response: Response) {
        const json = response.json();
        return new Error('Error', json.alert.messages[0]);
    }

    constructor(public title: string, public message: string) {
    }

}