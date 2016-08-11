import { Injectable } from '@angular/core';

@Injectable()
export class RAMConstantsService {

    public AUSkey = {
        DEVICE_TYPE: 'DEVICE'
    };

    public RelationshipTypeCategory = {
        AUTHORISATION: 'AUTHORISATION',
        NOTIFICATION: 'NOTIFICATION'
    };

    public RelationshipInitiatedBy = {
        SUBJECT: 'SUBJECT',
        DELEGATE: 'DELEGATE'
    };

    public RelationshipTypeCode = {
        OSP: 'OSP'
    };

    public RelationshipTypeAttributeCode = {
        SSID: 'SSID',
        SELECTED_GOVERNMENT_SERVICES_LIST: 'SELECTED_GOVERNMENT_SERVICES_LIST',
        SUBJECT_RELATIONSHIP_TYPE_DECLARATION: 'SUBJECT_RELATIONSHIP_TYPE_DECLARATION'
    };

    public RoleStatusCode = {
        ACTIVE: 'ACTIVE'
    };

}