import { Injectable } from '@angular/core';

@Injectable()
export class RAMConstantsService {

    public PageSizeOptions = [5, 10, 25, 100];
    public DefaultPageSize = 5;
    public PartyId = '5719bc5d65cae16c197e1ecd';

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