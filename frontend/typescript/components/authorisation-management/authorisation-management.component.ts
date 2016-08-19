import {Input, Component} from '@angular/core';
import {IRelationshipAttributeNameUsage} from '../../../../commons/RamAPI';

@Component({
    selector: 'authorisation-management',
    templateUrl: 'authorisation-management.component.html'
})
export class AuthorisationManagementComponent {
    @Input('title') public title:string;
    @Input('data') public data:AuthorisationManagementComponentData;
    @Input('attributeNameUsage') public attributeNameUsage:IRelationshipAttributeNameUsage;

    public setCanManagePermissions(value:string) {
        this.data.value = value;
    }
}

export interface AuthorisationManagementComponentData {
    value: string;
}