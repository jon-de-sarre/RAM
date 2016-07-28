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

export class SearchResult<T> implements ISearchResult<T> {
    constructor(public page:number, public totalCount:number, public pageSize:number, public list:T[]) {
    }

    public map<U>(callback:(value:T, index:number, array:T[]) => U):SearchResult<U> {
        return new SearchResult(this.page, this.totalCount, this.pageSize, this.list.map(callback));
    }
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

    public isEmpty():boolean {
        return Object.keys(this.data).length === 0;
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
// business domain ....................................................................................................

export interface IPrincipal {
    id: string;
    displayName: string;
    agencyUserInd: boolean;
}

export class Principal implements IPrincipal {
    constructor(public id:string,
                public displayName:string,
                public agencyUserInd:boolean) {
    }
}

export interface IAgencyUser {
    id: string;
    givenName: string;
    familyName: string;
    displayName: string;
    programRoles: IAgencyUserProgramRole[]
}

export class AgencyUser implements IAgencyUser {
    constructor(public id:string,
                public givenName:string,
                public familyName:string,
                public displayName:string,
                public programRoles:AgencyUserProgramRole[]) {
    }
}

export interface IAgencyUserProgramRole {
    program: string;
    role: string;
}

export class AgencyUserProgramRole implements IAgencyUserProgramRole {
    constructor(public program:string,
                public role:string) {
    }
}

export interface ICodeDecode {
    code: string;
    shortDecodeText: string;
    longDecodeText: string;
    startTimestamp: Date;
    endTimestamp: Date;
}

export class CodeDecode implements ICodeDecode {
    constructor(public code:string,
                public shortDecodeText:string,
                public longDecodeText:string,
                public startTimestamp:Date,
                public endTimestamp:Date) {
    }
}

export interface ILink {
    type: string;
    href: string;
}

export class Link implements ILink {
    constructor(public type: string, public href:string) {
    }
}

export interface IHrefValue<T> {
    href: string;
    value?: T;
}

export class HrefValue<T> implements IHrefValue<T> {
    constructor(public href:string,
                public value?:T) {
    }
}

export interface IParty {
    partyType: string;
    identities: Array<IHrefValue<IIdentity>>;
}

export class Party implements IParty {
    constructor(public partyType:string,
                public identities:HrefValue<Identity>[]) {
    }
}

export interface IPartyType {
    code: string;
    shortDecodeText: string;
}

export class PartyType implements IPartyType{
    constructor(public code:string,
                public shortDecodeText:string) {
    }
}

export interface IName {
    givenName?: string;
    familyName?: string;
    unstructuredName?: string;
    _displayName?: string;
}

export class Name implements IName {
    constructor(public givenName:string,
                public familyName:string,
                public unstructuredName:string,
                public _displayName:string) {
    }

    public displayName():string {
        return this.unstructuredName ? this.unstructuredName : this.givenName + ' ' + this.familyName;
    }
}

export interface IRelationship {
    _links: ILink[];
    relationshipType: IHrefValue<IRelationshipType>;
    subject: IHrefValue<IParty>;
    subjectNickName?: IName;
    delegate: IHrefValue<IParty>;
    delegateNickName?: IName;
    startTimestamp: Date;
    endTimestamp?: Date;
    endEventTimestamp?: Date,
    status: string;
    attributes: IRelationshipAttribute[];
}

export class Relationship implements IRelationship {
    constructor(public _links:Link[],
                public relationshipType:HrefValue<RelationshipType>,
                public subject:HrefValue<Party>,
                public subjectNickName:Name,
                public delegate:HrefValue<Party>,
                public delegateNickName:Name,
                public startTimestamp:Date,
                public endTimestamp:Date,
                public endEventTimestamp:Date,
                public status:string,
                public attributes:RelationshipAttribute[]) {
    }
}

export interface IRelationshipStatus {
    code: string;
    shortDecodeText: string;
}

export class RelationshipStatus implements IRelationshipStatus {
    constructor(public code:string,
                public shortDecodeText:string) {
    }
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

export class RelationshipType extends CodeDecode implements RelationshipType {
    constructor(code:string,
                shortDecodeText:string,
                longDecodeText:string,
                startTimestamp:Date,
                endTimestamp:Date,
                public voluntaryInd:boolean,
                public managedExternallyInd:boolean,
                public category:string,
                public relationshipAttributeNames:RelationshipAttributeNameUsage[]) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export interface IRelationshipAttributeNameUsage {
    mandatory: boolean;
    defaultValue: string;
    attributeNameDef: IHrefValue<IRelationshipAttributeName>;
}

export class RelationshipAttributeNameUsage implements IRelationshipAttributeNameUsage {
    constructor(public mandatory:boolean,
                public defaultValue:string,
                public attributeNameDef:HrefValue<RelationshipAttributeName>) {
    }
}

export interface IRelationshipAttributeName extends ICodeDecode {
    domain: string;
    classifier: string;
    category: string;
    permittedValues: string[];
}

export class RelationshipAttributeName extends CodeDecode implements IRelationshipAttributeName {
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

interface ISharedSecret {
    value: string;
    sharedSecretType: ISharedSecretType;
}

export class RoleAttributeName extends CodeDecode {
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

export class SharedSecret implements ISharedSecret {
    constructor(public value:string,
                public sharedSecretType:SharedSecretType) {
    }
}

export interface ISharedSecretType extends ICodeDecode {
    domain: string;
}

export class SharedSecretType extends CodeDecode implements ISharedSecretType {
    constructor(code:string,
                shortDecodeText:string,
                longDecodeText:string,
                startTimestamp:Date,
                endTimestamp:Date,
                public domain:string) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export interface ILegislativeProgram extends ICodeDecode {
}

export class LegislativeProgram extends CodeDecode implements ILegislativeProgram {
    constructor(code:string,
                shortDecodeText:string,
                longDecodeText:string,
                startTimestamp:Date,
                endTimestamp:Date) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export interface IProfile {
    provider: string;
    name: IName;
    sharedSecrets: ISharedSecret[];
}

export class Profile implements IProfile {
    constructor(public provider:string,
                public name:Name,
                public sharedSecrets:SharedSecret[]) {
    }
}

export interface IProfileProvider {
    code: string;
    shortDecodeText: string;
}

export class ProfileProvider implements IProfileProvider {
    constructor(public code:string,
                public shortDecodeText:string) {
    }
}

export interface IIdentity {
    idValue: string;
    rawIdValue: string;
    identityType: string;
    defaultInd: boolean;
    agencyScheme: string;
    agencyToken: string;
    invitationCodeStatus: string;
    invitationCodeExpiryTimestamp: Date;
    invitationCodeClaimedTimestamp: Date;
    invitationCodeTemporaryEmailAddress: string;
    publicIdentifierScheme: string;
    linkIdScheme: string;
    linkIdConsumer: string;
    profile: IProfile;
    party: IHrefValue<IParty>;
}

export class Identity implements IIdentity {
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

export interface IRelationshipAttribute {
    value: string;
    attributeName: IHrefValue<IRelationshipAttributeName>;
}

export class RelationshipAttribute implements IRelationshipAttribute {
    constructor(public value:string,
                public attributeName:HrefValue<RelationshipAttributeName>) {
    }
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

export interface IRole {
    _links: ILink[];
    roleType: IHrefValue<IRoleType>;
    party: IHrefValue<IParty>;
    startTimestamp: Date;
    endTimestamp?: Date;
    endEventTimestamp?: Date,
    assignedTimestamp?: Date,
    attributes: IRoleAttribute[];
}

export class Role implements IRole {
    constructor(public _links:Link[],
                public roleType:IHrefValue<IRoleType>,
                public party:IHrefValue<IParty>,
                public startTimestamp:Date,
                public endTimestamp:Date,
                public endEventTimestamp:Date,
                public assignedTimestamp:Date,
                public status:string,
                public attributes:RoleAttribute[]) {
    }
}

export interface IRoleStatus {
    code: string;
    shortDecodeText: string;
}

export class RoleStatus implements IRoleStatus {
    constructor(public code: string,
                public shortDecodeText: string) {
    }
}

export interface IRoleSearchDTO {
    totalCount: number;
    pageSize: number;
    list: Array<IHrefValue<IRole>>;
}

export class RoleSearchDTO implements IRoleSearchDTO {
    constructor(public totalCount: number,
                public pageSize: number,
                public list: Array<IHrefValue<IRole>>) {
    }
}

export interface IRoleType extends ICodeDecode {
    voluntaryInd: boolean;
    roleAttributeNames: IRoleAttributeNameUsage[];
}

export class RoleType extends CodeDecode implements IRoleType {
    constructor(code: string,
                shortDecodeText: string,
                longDecodeText: string,
                startTimestamp: Date,
                endTimestamp: Date,
                public  voluntaryInd: boolean,
                public roleAttributeNames: IRoleAttributeNameUsage[]) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}

export interface IRoleAttribute {
    value: string;
    attributeName: IHrefValue<IRoleAttributeName>;
}

export class RoleAttribute implements IRoleAttribute {
    constructor(public value:string,
                public attributeName:HrefValue<RoleAttributeName>) {
    }
}

export interface IRoleAttributeNameUsage {
    mandatory: boolean;
    defaultValue: string;
    attributeNameDef: IHrefValue<IRoleAttributeName>;
}

export class RoleAttributeNameUsage implements IRelationshipAttributeNameUsage {
    constructor(public mandatory: boolean,
                public defaultValue: string,
                public attributeNameDef: IHrefValue<IRoleAttributeName>) {
    }
}

export interface IRoleAttributeName extends ICodeDecode {
    domain: string;
    classifier: string;
    category: string;
    permittedValues: string[];
}