export class Headers {

    public static Prefix = `x-ram`;

    public static AuthToken = `${Headers.Prefix}-auth-token`;
    public static AuthTokenDecoded = `${Headers.Prefix}-auth-token-decoded`;

    public static Identity = `${Headers.Prefix}-identity`;
    public static IdentityIdValue = `${Headers.Prefix}-identity-idvalue`;
    public static IdentityRawIdValue = `${Headers.Prefix}-identity-rawidvalue`;
    public static IdentityType = `${Headers.Prefix}-identitytype`;

    public static PartyType = `${Headers.Prefix}-partytype`;

    public static GivenName = `${Headers.Prefix}-givenname`;
    public static FamilyName = `${Headers.Prefix}-familyname`;
    public static UnstructuredName = `${Headers.Prefix}-unstructuredname`;
    public static DOB = `${Headers.Prefix}-dob`;

    public static ProfileProvider = `${Headers.Prefix}-profileprovider`;

    public static AgencyScheme = `${Headers.Prefix}-agencyscheme`;
    public static AgencyToken = `${Headers.Prefix}-agencytoken`;
    public static LinkIdScheme = `${Headers.Prefix}-linkidscheme`;
    public static LinkIdConsumer = `${Headers.Prefix}-linkidconsumer`;
    public static PublicIdentifierScheme = `${Headers.Prefix}-publicidentifierscheme`;

    public static isXRAMHeader(headerName:string) {
        return headerName.toLowerCase().startsWith(Headers.Prefix);
    }
}