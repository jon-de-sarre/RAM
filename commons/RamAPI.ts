// system domain ......................................................................................................

export enum RAMMessageType {
    Error = 1,
    Info = 2,
    Success = 3
}

export interface IResponse<T> {
    data?:T;
    token?:string;
    alert?:Alert;
}

export interface Alert {
    messages:string[];
    alertType:RAMMessageType;
}

export class ErrorResponse implements IResponse<void> {
    alert:Alert;

    constructor(messages:string | string[],
                alertType:number = RAMMessageType.Error) {
        if (Array.isArray(messages)) {
            this.alert = {messages: messages, alertType: alertType};
        } else {
            this.alert = {messages: [messages], alertType: alertType};
        }
    }
}

export class HrefValue<T> {
    constructor(public href:string,
                public value?:T) {
    }
}

export class Link {
    constructor(public type: string, public href:string) {
    }
}

// todo this needs a page index?
export class SearchResult<T> {
    constructor(public page:number, public totalCount:number, public pageSize:number, public list:T[]) {
    }

    public map<U>(callback:(value:T, index:number, array:T[]) => U):SearchResult<U> {
        return new SearchResult(this.page, this.totalCount, this.pageSize, this.list.map(callback));
    }
}

// business domain ....................................................................................................

export class Principal {
    constructor(public id:string,
                public displayName:string,
                public agencyUserInd:boolean) {
    }
}

export class AgencyUser {
    constructor(public id:string,
                public givenName:string,
                public familyName:string,
                public displayName:string,
                public programRoles:AgencyUserProgramRole[]) {
    }
}

export class AgencyUserProgramRole {
    constructor(public program:string,
                public role:string) {
    }
}

// todo do we drop the I?
export class ICodeDecode {
    constructor(public code:string,
                public shortDecodeText:string,
                public longDecodeText:string,
                public startTimestamp:Date,
                public endTimestamp:Date) {
    }
}

export class RelationshipType extends ICodeDecode {
    constructor(code:string,
                shortDecodeText:string,
                longDecodeText:string,
                startTimestamp:Date,
                endTimestamp:Date,
                public voluntaryInd:boolean,
                public relationshipAttributeNames:RelationshipAttributeNameUsage[]) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export class RelationshipAttributeNameUsage {
    constructor(public mandatory:boolean,
                public defaultValue:string,
                public attributeNameDef:HrefValue<RelationshipAttributeName>) {
    }
}

export class RelationshipAttributeName extends ICodeDecode {
    constructor(code:string,
                shortDecodeText:string,
                longDecodeText:string,
                startTimestamp:Date,
                endTimestamp:Date,
                public name:string,
                public domain:string,
                public classifier:string,
                public category:string,
                public permittedValues:string[]) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export class Name {
    constructor(public givenName:string,
                public familyName:string,
                public unstructuredName:string,
                public _displayName:string) {
    }

    public displayName():string {
        return this.unstructuredName ? this.unstructuredName : this.givenName + ' ' + this.familyName;
    }
}

export class SharedSecret {
    constructor(public value:string,
                public sharedSecretType:SharedSecretType) {
    }
}

export class SharedSecretType extends ICodeDecode {
    constructor(code:string,
                shortDecodeText:string,
                longDecodeText:string,
                startTimestamp:Date,
                endTimestamp:Date,
                public domain:string) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export class LegislativeProgram extends ICodeDecode {
    constructor(code:string,
                shortDecodeText:string,
                longDecodeText:string,
                startTimestamp:Date,
                endTimestamp:Date) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export class Profile {
    constructor(public provider:string,
                public name:Name,
                public sharedSecrets:SharedSecret[]) {
    }
}

export class ProfileProvider {
    constructor(public code:string,
                public shortDecodeText:string) {
    }
}

export class Identity {
    constructor(public idValue:string,
                public rawIdValue:string,
                public identityType:string,
                public defaultInd:boolean,
                public agencyScheme:string,
                public agencyToken:string,
                public invitationCodeStatus:string,
                public invitationCodeExpiryTimestamp:Date,
                public invitationCodeClaimedTimestamp:Date,
                public invitationCodeTemporaryEmailAddress:string,
                public publicIdentifierScheme:string,
                public linkIdScheme:string,
                public linkIdConsumer:string,
                public profile:Profile,
                public party:HrefValue<Party>) {
    }
}

export class Party {
    constructor(public partyType:string,
                public identities:HrefValue<Identity>[]) {
    }
}

export class PartyType {
    constructor(public code:string,
                public shortDecodeText:string) {
    }
}

export class Relationship {
    constructor(public _links:Link[],
                public relationshipType:RelationshipType,
                public subject:Party,
                public subjectNickName:Name,
                public delegate:Party,
                public delegateNickName:Name,
                public startTimestamp:Date,
                public endTimestamp:Date,
                public endEventTimestamp:Date,
                public status:string,
                public attributes:RelationshipAttribute[]) {
    }
}

export class RelationshipStatus {
    constructor(public code:string,
                public shortDecodeText:string) {
    }
}

export class RelationshipAttribute {
    constructor(public value:string,
                public attributeName:HrefValue<RelationshipAttributeName>) {
    }
}
