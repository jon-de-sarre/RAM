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
            this.alert = {messages: messages, alertType: alertType} as Alert;
        } else {
            this.alert = {messages: [messages], alertType: alertType} as Alert;
        }
    }
}

export interface ISearchResult<T> {
    page: number,
    totalCount: number,
    pageSize: number,
    list: T[];
}

export interface IPrincipal {
    id: string;
    displayName: string;
    agencyUserInd: boolean;
}

export interface IAgencyUser {
    id: string;
    givenName: string;
    familyName: string;
    displayName: string;
    programRoles: IAgencyUserProgramRole[]
}

export interface IAgencyUserProgramRole {
    program: string;
    role: string;
}

export interface ICodeDecode {
    code: string;
    shortDecodeText: string;
    longDecodeText: string;
    startTimestamp: string;
    endTimestamp: string;
}

export interface ILink {
    type: string;
    href: string;
}

export interface IHrefValue<T> {
    href: string;
    value?: T;
}

export interface IParty {
    partyType: string;
    identities: Array<IHrefValue<IIdentity>>;
}

export interface IPartyType {
    code: string;
    shortDecodeText: string;
}

export interface IName {
    givenName?: string;
    familyName?: string;
    unstructuredName?: string;
    _displayName?: string;
}

export interface IRelationship {
    _links: ILink[];
    relationshipType: IHrefValue<IRelationshipType>;
    subject: IHrefValue<IParty>;
    subjectNickName?: IName;
    delegate: IHrefValue<IParty>;
    delegateNickName?: IName;
    startTimestamp: string;
    endTimestamp?: string;
    endEventTimestamp?: string,
    status: string;
    attributes: IRelationshipAttribute[];
}

export interface IRelationshipStatus {
    code: string;
    shortDecodeText: string;
}

export interface RelationshipSearchDTO {
    totalCount: number;
    pageSize: number;
    list: Array<IHrefValue<IRelationship>>;
}

export interface IRelationshipType extends ICodeDecode {
    voluntaryInd: boolean;
    relationshipAttributeNames: IRelationshipAttributeNameUsage[];
}

export interface IRelationshipAttributeNameUsage {
    mandatory: boolean;
    defaultValue: string;
    attributeNameDef: IHrefValue<IRelationshipAttributeName>;

}

export interface IRelationshipAttributeName extends ICodeDecode {
    domain: string;
    classifier: string;
    category: string;
    permittedValues: string[];
}
interface ISharedSecret {
    value: string;
    sharedSecretType: ISharedSecretType;
}

export interface ISharedSecretType extends ICodeDecode {
    domain: string;
}

export interface ILegislativeProgram extends ICodeDecode {
}

export interface IProfile {
    provider: string;
    name: IName;
    sharedSecrets: ISharedSecret[];
}

export interface IProfileProvider {
    code: string;
    shortDecodeText: string;
}

export interface IIdentity {
    idValue: string;
    rawIdValue: string;
    identityType: string;
    defaultInd: boolean;
    agencyScheme: string;
    agencyToken: string;
    invitationCodeStatus: string;
    invitationCodeExpiryTimestamp: string;
    invitationCodeClaimedTimestamp: string;
    invitationCodeTemporaryEmailAddress: string;
    publicIdentifierScheme: string;
    linkIdScheme: string;
    linkIdConsumer: string;
    profile: IProfile;
    party: IHrefValue<IParty>;
}

export interface IRelationshipAttribute {
    value: string;
    attributeName: IHrefValue<IRelationshipAttributeName>;
}

export interface ICreateInvitationCodeDTO {
    givenName?:string;
    familyName?:string;
    sharedSecretValue:string;
}

export interface ICreateIdentityDTO {
    rawIdValue?:string;
    partyType:string;
    givenName?:string;
    familyName?:string;
    unstructuredName?:string;
    sharedSecretTypeCode:string;
    sharedSecretValue:string;
    identityType:string;
    agencyScheme?:string;
    agencyToken?:string;
    linkIdScheme?:string;
    linkIdConsumer?:string;
    publicIdentifierScheme?:string;
    profileProvider?:string;
}

export interface IAttributeDTO {
    code:string;
    value:string;
}

export interface IInvitationCodeRelationshipAddDTO {
    relationshipType:string;
    subjectIdValue:string;
    delegate:ICreateInvitationCodeDTO;
    startTimestamp:Date;
    endTimestamp:Date;
    attributes:IAttributeDTO[];
}

export interface INotifyDelegateDTO {
    email:string;
}

declare type FilterParamsData = {
    [key: string]: string;
};

export class FilterParams {

    private data: FilterParamsData = {};

    public get(key:string, defaultValue?:string):string {
        const value = this.data[key];
        return value ? value: defaultValue;
    }

    public add(key:string, value:Object):FilterParams {
        this.data[key] = value ? value.toString() : null;
        return this;
    }

    public encode(): string {
        let filter = '';
        for (let key of Object.keys(this.data)) {
            if (this.data.hasOwnProperty(key)) {
                const value = this.data[key];
                if (value && value !== '' && value !== '-') {
                    if (filter.length > 0) {
                        filter += '&';
                    }
                    filter += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }
            }
        }
        filter = encodeURIComponent(filter);
        return filter;
    };

    public static decode(filter: string): FilterParams {
        const filterParams = new FilterParams();
        if (filter) {
            const params = decodeURIComponent(filter).split('&');
            for (let param of params) {
                const key = param.split('=')[0];
                const value = param.split('=')[1];
                filterParams.add(decodeURIComponent(key), decodeURIComponent(value));
            }
        }
        return filterParams;
    }

}

