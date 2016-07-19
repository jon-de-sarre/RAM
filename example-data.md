
Exporting example data

[22:50:00] Using gulpfile ~/IdeaProjects/deloitte/ato/ram/multi-module-ram/backend/gulpfile.js
[22:50:00] Starting 'ts:lint'...
           Skipping 'ts:lint' via --no-lint
[22:50:00] Finished 'ts:lint' after 108 μs
[22:50:00] Starting 'ts:compile'...
[22:50:03] TypeScript: 26 semantic errors
[22:50:03] TypeScript: emit succeeded (with errors)
[22:50:03] Finished 'ts:compile' after 2.81 s
[22:50:03] Starting 'export'...

Connected to the db: mongodb://127.0.0.1:27017/ram



# Table of Contents
1. [Identity : INVITATION_CODE](#Identity-:-INVITATION_CODE)
1. [Identity : ABN](#Identity-:-ABN)
1. [RelationshipType : UNIVERSAL_REPRESENTATIVE](#RelationshipType-:-UNIVERSAL_REPRESENTATIVE)
1. [Relationship : Associate](#Relationship-:-Associate)
1. [Relationship : Custom Representative](#Relationship-:-Custom-Representative)
1. [Relationship : Universal Representative](#Relationship-:-Universal-Representative)

## Identity : INVITATION_CODE
```
{
  "__v": 0,
  "seq": 72,
  "updatedAt": "2016-07-16T12:50:04.161Z",
  "createdAt": "2016-07-16T12:50:04.161Z",
  "idValue": "INVITATION_CODE:ZVNgEX",
  "rawIdValue": "ZVNgEX",
  "identityType": "INVITATION_CODE",
  "invitationCodeStatus": "PENDING",
  "invitationCodeExpiryTimestamp": "2016-07-23T12:50:04.156Z",
  "profile": {
    "__v": 0,
    "updatedAt": "2016-07-16T12:50:04.154Z",
    "createdAt": "2016-07-16T12:50:04.154Z",
    "provider": "INVITATION",
    "name": {
      "__v": 0,
      "updatedAt": "2016-07-16T12:50:04.057Z",
      "createdAt": "2016-07-16T12:50:04.057Z",
      "_displayName": "Homer Simpson",
      "givenName": "Homer",
      "familyName": "Simpson",
      "_id": "578a2d7ccb37eb9edc573d9c",
      "resourceVersion": "1",
      "deleteInd": false
    },
    "sharedSecrets": [
      {
        "__v": 0,
        "updatedAt": "2016-07-16T12:50:04.149Z",
        "createdAt": "2016-07-16T12:50:04.149Z",
        "value": "$2a$10$CQ2.aXN4wGOEY5NFBGZtS.OKmtPpEKGUyJhNRqOT0A7l3zt7PG9nq",
        "sharedSecretType": {
          "_id": "57889f80fb7ac8d9bcc3f6eb",
          "code": "DATE_OF_BIRTH",
          "shortDecodeText": "Date of Birth",
          "longDecodeText": "Date of Birth",
          "startDate": "2016-07-15T08:32:00.437Z",
          "domain": "DEFAULT",
          "__v": 0
        },
        "_id": "578a2d7ccb37eb9edc573d9d",
        "resourceVersion": "1",
        "deleteInd": false
      }
    ],
    "_id": "578a2d7ccb37eb9edc573d9e",
    "resourceVersion": "1",
    "deleteInd": false
  },
  "party": {
    "__v": 0,
    "updatedAt": "2016-07-16T12:50:04.155Z",
    "createdAt": "2016-07-16T12:50:04.155Z",
    "partyType": "INDIVIDUAL",
    "_id": "578a2d7ccb37eb9edc573d9f",
    "resourceVersion": "1",
    "deleteInd": false
  },
  "defaultInd": true,
  "_id": "578a2d7ccb37eb9edc573da0",
  "resourceVersion": "1",
  "deleteInd": false
}
```

## Identity : ABN
```
{
  "_id": "57889f80fb7ac8d9bcc3f6f4",
  "seq": 3,
  "updatedAt": "2016-07-15T08:32:00.703Z",
  "createdAt": "2016-07-15T08:32:00.703Z",
  "idValue": "PUBLIC_IDENTIFIER:ABN:cakerybakery_identity_1",
  "rawIdValue": "cakerybakery_identity_1",
  "identityType": "PUBLIC_IDENTIFIER",
  "publicIdentifierScheme": "ABN",
  "profile": {
    "_id": "57889f80fb7ac8d9bcc3f6f2",
    "updatedAt": "2016-07-15T08:32:00.699Z",
    "createdAt": "2016-07-15T08:32:00.699Z",
    "provider": "ABR",
    "name": {
      "_id": "57889f80fb7ac8d9bcc3f6f1",
      "updatedAt": "2016-07-15T08:32:00.696Z",
      "createdAt": "2016-07-15T08:32:00.696Z",
      "_displayName": "Cakery Bakery Pty Ltd",
      "unstructuredName": "Cakery Bakery Pty Ltd",
      "__v": 0,
      "resourceVersion": "1",
      "deleteInd": false
    },
    "__v": 0,
    "sharedSecrets": [],
    "resourceVersion": "1",
    "deleteInd": false
  },
  "party": {
    "_id": "57889f80fb7ac8d9bcc3f6f3",
    "updatedAt": "2016-07-15T08:32:00.700Z",
    "createdAt": "2016-07-15T08:32:00.700Z",
    "partyType": "ABN",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "__v": 0,
  "defaultInd": true,
  "resourceVersion": "1",
  "deleteInd": false
}
```

## RelationshipType : UNIVERSAL_REPRESENTATIVE
```
{
  "_id": "57889f80fb7ac8d9bcc3f6db",
  "code": "UNIVERSAL_REPRESENTATIVE",
  "shortDecodeText": "Universal Representative",
  "longDecodeText": "Universal Representative",
  "startDate": "2016-07-15T08:32:00.437Z",
  "__v": 0,
  "attributeNameUsages": [
    {
      "_id": "57889f80fb7ac8d9bcc3f6cd",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b0",
        "code": "PERMISSION_CUSTOMISATION_ALLOWED_IND",
        "shortDecodeText": "Permission Customisation Allowed Indicator",
        "longDecodeText": "Permission Customisation Allowed Indicator",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship type allows the user to customise permission levels",
        "__v": 0,
        "permittedValues": []
      },
      "defaultValue": "false",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6ce",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b1",
        "code": "DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND",
        "shortDecodeText": "Do you want this representative to manage authorisations for this organisation?",
        "longDecodeText": "(This includes the ability to create, view, modify and cancel authorisations)",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship allows the delegate to manage authorisations",
        "__v": 0,
        "permittedValues": []
      },
      "defaultValue": "false",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6cf",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b2",
        "code": "DELEGATE_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Delegate Relationship Type Declaration",
        "longDecodeText": "Delegate Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Delegate specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "defaultValue": "Markdown for Delegate Universal Representative Declaration",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d0",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b3",
        "code": "SUBJECT_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Subject Relationship Type Declaration",
        "longDecodeText": "Subject Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Subject specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "defaultValue": "Markdown for Subject Universal Representative Declaration",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d1",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b4",
        "code": "ASIC_ABN_PERMISSION",
        "shortDecodeText": "Australian Securities and Investments Commission (ASIC)",
        "longDecodeText": "ABN / BN Project (limited release)",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d2",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b5",
        "code": "WGEA_ACTIVATE_PERMISSION",
        "shortDecodeText": "Workplace Gender Equality Agency (WGEA)",
        "longDecodeText": "Activate",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d3",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b6",
        "code": "DEPTOFINDUSTRY_ABA_PERMISSION",
        "shortDecodeText": "Department of Industry",
        "longDecodeText": "Australian Business Account (ABA) - ABLIS",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d4",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b7",
        "code": "ABR_ABR_PERMISSION",
        "shortDecodeText": "Australian Business Register (ABR)",
        "longDecodeText": "Australian Business Register",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d5",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b8",
        "code": "DEPTOFINDUSTRY_ATS_PERMISSION",
        "shortDecodeText": "Department of Industry",
        "longDecodeText": "Automotive Transformation Scheme (ATS)",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d6",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b9",
        "code": "NTDEPTOFBUSINESS_AVETMISS_PERMISSION",
        "shortDecodeText": "NT Department of Business",
        "longDecodeText": "AVETMISS Training Portal",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d7",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6ba",
        "code": "NTDEPTOFCORPINFOSERVICES_IMS_PERMISSION",
        "shortDecodeText": "NT Department of Corporate & Information Services - DCIS",
        "longDecodeText": "Identity Management System (IMS) - Invoice Portal – Invoice NTG",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d8",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6bb",
        "code": "DEPTOFHUMANSERVICESCENTRELINK_PPL_PERMISSION",
        "shortDecodeText": "Department of Human Services - Centrelink",
        "longDecodeText": "Paid Parental Leave",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6d9",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6bc",
        "code": "DEPTOFIMMIGRATION_SKILLSELECT_PERMISSION",
        "shortDecodeText": "Department of Immigration and Border Protection",
        "longDecodeText": "Skill Select",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f6da",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6bd",
        "code": "DEPTEMPLOYMENT_WAGECONNECT_PERMISSION",
        "shortDecodeText": "Department of Employment",
        "longDecodeText": "Wage Connect",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "SELECT_SINGLE",
        "classifier": "PERMISSION",
        "category": "Administrative Services",
        "purposeText": "A permission for a relationship",
        "__v": 0,
        "permittedValues": [
          "Full access",
          "Limited access",
          "No access"
        ]
      },
      "defaultValue": "Full access",
      "__v": 0,
      "optionalInd": false
    }
  ],
  "voluntaryInd": false,
  "minIdentityStrength": 0,
  "minCredentialStrength": 0
}
```

## Relationship : Associate
```
{
  "_id": "57889f80fb7ac8d9bcc3f710",
  "updatedAt": "2016-07-15T08:32:00.930Z",
  "createdAt": "2016-07-15T08:32:00.930Z",
  "_subjectABNString": "jenscatering_identity_1",
  "_delegatePartyTypeCode": "INDIVIDUAL",
  "_subjectPartyTypeCode": "ABN",
  "_delegateNickNameString": "Jennifer Maxims",
  "_subjectNickNameString": "Jen's Catering Pty Ltd",
  "_relationshipTypeCode": "ASSOCIATE",
  "relationshipType": {
    "_id": "57889f80fb7ac8d9bcc3f6cc",
    "code": "ASSOCIATE",
    "shortDecodeText": "Associate",
    "longDecodeText": "Associate",
    "startDate": "2016-07-15T08:32:00.437Z",
    "__v": 0,
    "attributeNameUsages": [
      "57889f80fb7ac8d9bcc3f6be",
      "57889f80fb7ac8d9bcc3f6bf",
      "57889f80fb7ac8d9bcc3f6c0",
      "57889f80fb7ac8d9bcc3f6c1",
      "57889f80fb7ac8d9bcc3f6c2",
      "57889f80fb7ac8d9bcc3f6c3",
      "57889f80fb7ac8d9bcc3f6c4",
      "57889f80fb7ac8d9bcc3f6c5",
      "57889f80fb7ac8d9bcc3f6c6",
      "57889f80fb7ac8d9bcc3f6c7",
      "57889f80fb7ac8d9bcc3f6c8",
      "57889f80fb7ac8d9bcc3f6c9",
      "57889f80fb7ac8d9bcc3f6ca",
      "57889f80fb7ac8d9bcc3f6cb"
    ],
    "voluntaryInd": false,
    "minIdentityStrength": 0,
    "minCredentialStrength": 0
  },
  "subject": {
    "_id": "57889f80fb7ac8d9bcc3f705",
    "updatedAt": "2016-07-15T08:32:00.876Z",
    "createdAt": "2016-07-15T08:32:00.876Z",
    "partyType": "ABN",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "subjectNickName": {
    "_id": "57889f80fb7ac8d9bcc3f703",
    "updatedAt": "2016-07-15T08:32:00.873Z",
    "createdAt": "2016-07-15T08:32:00.873Z",
    "_displayName": "Jen's Catering Pty Ltd",
    "unstructuredName": "Jen's Catering Pty Ltd",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "delegate": {
    "_id": "57889f80fb7ac8d9bcc3f6f8",
    "updatedAt": "2016-07-15T08:32:00.782Z",
    "createdAt": "2016-07-15T08:32:00.782Z",
    "partyType": "INDIVIDUAL",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "delegateNickName": {
    "_id": "57889f80fb7ac8d9bcc3f6f5",
    "updatedAt": "2016-07-15T08:32:00.706Z",
    "createdAt": "2016-07-15T08:32:00.706Z",
    "_displayName": "Jennifer Maxims",
    "givenName": "Jennifer",
    "familyName": "Maxims",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "startTimestamp": "2016-07-15T08:32:00.913Z",
  "status": "ACTIVE",
  "__v": 0,
  "_delegateProfileProviderCodes": [
    "MY_GOV"
  ],
  "_subjectProfileProviderCodes": [
    "ABR"
  ],
  "attributes": [
    {
      "_id": "57889f80fb7ac8d9bcc3f70c",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b0",
        "code": "PERMISSION_CUSTOMISATION_ALLOWED_IND",
        "shortDecodeText": "Permission Customisation Allowed Indicator",
        "longDecodeText": "Permission Customisation Allowed Indicator",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship type allows the user to customise permission levels",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f70d",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b1",
        "code": "DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND",
        "shortDecodeText": "Do you want this representative to manage authorisations for this organisation?",
        "longDecodeText": "(This includes the ability to create, view, modify and cancel authorisations)",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship allows the delegate to manage authorisations",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f70e",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b2",
        "code": "DELEGATE_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Delegate Relationship Type Declaration",
        "longDecodeText": "Delegate Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Delegate specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f70f",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b3",
        "code": "SUBJECT_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Subject Relationship Type Declaration",
        "longDecodeText": "Subject Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Subject specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    }
  ],
  "resourceVersion": "1",
  "deleteInd": false
}
```

## Relationship : Custom Representative
```
{
  "_id": "57889f80fb7ac8d9bcc3f70b",
  "updatedAt": "2016-07-15T08:32:00.911Z",
  "createdAt": "2016-07-15T08:32:00.911Z",
  "_subjectABNString": "cakerybakery_identity_1",
  "_delegatePartyTypeCode": "INDIVIDUAL",
  "_subjectPartyTypeCode": "ABN",
  "_delegateNickNameString": "Jennifer Maxims",
  "_subjectNickNameString": "Cakery Bakery Pty Ltd",
  "_relationshipTypeCode": "CUSTOM_REPRESENTATIVE",
  "relationshipType": {
    "_id": "57889f80fb7ac8d9bcc3f6ea",
    "code": "CUSTOM_REPRESENTATIVE",
    "shortDecodeText": "Custom Representative",
    "longDecodeText": "Custom Representative",
    "startDate": "2016-07-15T08:32:00.437Z",
    "__v": 0,
    "attributeNameUsages": [
      "57889f80fb7ac8d9bcc3f6dc",
      "57889f80fb7ac8d9bcc3f6dd",
      "57889f80fb7ac8d9bcc3f6de",
      "57889f80fb7ac8d9bcc3f6df",
      "57889f80fb7ac8d9bcc3f6e0",
      "57889f80fb7ac8d9bcc3f6e1",
      "57889f80fb7ac8d9bcc3f6e2",
      "57889f80fb7ac8d9bcc3f6e3",
      "57889f80fb7ac8d9bcc3f6e4",
      "57889f80fb7ac8d9bcc3f6e5",
      "57889f80fb7ac8d9bcc3f6e6",
      "57889f80fb7ac8d9bcc3f6e7",
      "57889f80fb7ac8d9bcc3f6e8",
      "57889f80fb7ac8d9bcc3f6e9"
    ],
    "voluntaryInd": false,
    "minIdentityStrength": 0,
    "minCredentialStrength": 0
  },
  "subject": {
    "_id": "57889f80fb7ac8d9bcc3f6f3",
    "updatedAt": "2016-07-15T08:32:00.700Z",
    "createdAt": "2016-07-15T08:32:00.700Z",
    "partyType": "ABN",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "subjectNickName": {
    "_id": "57889f80fb7ac8d9bcc3f6f1",
    "updatedAt": "2016-07-15T08:32:00.696Z",
    "createdAt": "2016-07-15T08:32:00.696Z",
    "_displayName": "Cakery Bakery Pty Ltd",
    "unstructuredName": "Cakery Bakery Pty Ltd",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "delegate": {
    "_id": "57889f80fb7ac8d9bcc3f6f8",
    "updatedAt": "2016-07-15T08:32:00.782Z",
    "createdAt": "2016-07-15T08:32:00.782Z",
    "partyType": "INDIVIDUAL",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "delegateNickName": {
    "_id": "57889f80fb7ac8d9bcc3f6f5",
    "updatedAt": "2016-07-15T08:32:00.706Z",
    "createdAt": "2016-07-15T08:32:00.706Z",
    "_displayName": "Jennifer Maxims",
    "givenName": "Jennifer",
    "familyName": "Maxims",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "startTimestamp": "2016-07-15T08:32:00.880Z",
  "status": "ACTIVE",
  "__v": 0,
  "_delegateProfileProviderCodes": [
    "MY_GOV"
  ],
  "_subjectProfileProviderCodes": [
    "ABR"
  ],
  "attributes": [
    {
      "_id": "57889f80fb7ac8d9bcc3f707",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b0",
        "code": "PERMISSION_CUSTOMISATION_ALLOWED_IND",
        "shortDecodeText": "Permission Customisation Allowed Indicator",
        "longDecodeText": "Permission Customisation Allowed Indicator",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship type allows the user to customise permission levels",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f708",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b1",
        "code": "DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND",
        "shortDecodeText": "Do you want this representative to manage authorisations for this organisation?",
        "longDecodeText": "(This includes the ability to create, view, modify and cancel authorisations)",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship allows the delegate to manage authorisations",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f709",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b2",
        "code": "DELEGATE_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Delegate Relationship Type Declaration",
        "longDecodeText": "Delegate Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Delegate specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f80fb7ac8d9bcc3f70a",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b3",
        "code": "SUBJECT_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Subject Relationship Type Declaration",
        "longDecodeText": "Subject Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Subject specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    }
  ],
  "resourceVersion": "1",
  "deleteInd": false
}
```

## Relationship : Universal Representative
```
{
  "_id": "57889f81fb7ac8d9bcc3f733",
  "updatedAt": "2016-07-15T08:32:01.253Z",
  "createdAt": "2016-07-15T08:32:01.253Z",
  "_subjectABNString": "jenscatering_identity_1",
  "_delegatePartyTypeCode": "INDIVIDUAL",
  "_subjectPartyTypeCode": "ABN",
  "_delegateNickNameString": "Zoe Zombie 001",
  "_subjectNickNameString": "Jen's Catering Pty Ltd",
  "_relationshipTypeCode": "UNIVERSAL_REPRESENTATIVE",
  "relationshipType": {
    "_id": "57889f80fb7ac8d9bcc3f6db",
    "code": "UNIVERSAL_REPRESENTATIVE",
    "shortDecodeText": "Universal Representative",
    "longDecodeText": "Universal Representative",
    "startDate": "2016-07-15T08:32:00.437Z",
    "__v": 0,
    "attributeNameUsages": [
      "57889f80fb7ac8d9bcc3f6cd",
      "57889f80fb7ac8d9bcc3f6ce",
      "57889f80fb7ac8d9bcc3f6cf",
      "57889f80fb7ac8d9bcc3f6d0",
      "57889f80fb7ac8d9bcc3f6d1",
      "57889f80fb7ac8d9bcc3f6d2",
      "57889f80fb7ac8d9bcc3f6d3",
      "57889f80fb7ac8d9bcc3f6d4",
      "57889f80fb7ac8d9bcc3f6d5",
      "57889f80fb7ac8d9bcc3f6d6",
      "57889f80fb7ac8d9bcc3f6d7",
      "57889f80fb7ac8d9bcc3f6d8",
      "57889f80fb7ac8d9bcc3f6d9",
      "57889f80fb7ac8d9bcc3f6da"
    ],
    "voluntaryInd": false,
    "minIdentityStrength": 0,
    "minCredentialStrength": 0
  },
  "subject": {
    "_id": "57889f80fb7ac8d9bcc3f705",
    "updatedAt": "2016-07-15T08:32:00.876Z",
    "createdAt": "2016-07-15T08:32:00.876Z",
    "partyType": "ABN",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "subjectNickName": {
    "_id": "57889f80fb7ac8d9bcc3f703",
    "updatedAt": "2016-07-15T08:32:00.873Z",
    "createdAt": "2016-07-15T08:32:00.873Z",
    "_displayName": "Jen's Catering Pty Ltd",
    "unstructuredName": "Jen's Catering Pty Ltd",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "delegate": {
    "_id": "57889f81fb7ac8d9bcc3f72d",
    "updatedAt": "2016-07-15T08:32:01.228Z",
    "createdAt": "2016-07-15T08:32:01.228Z",
    "partyType": "INDIVIDUAL",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "delegateNickName": {
    "_id": "57889f81fb7ac8d9bcc3f72a",
    "updatedAt": "2016-07-15T08:32:01.155Z",
    "createdAt": "2016-07-15T08:32:01.155Z",
    "_displayName": "Zoe Zombie 001",
    "givenName": "Zoe",
    "familyName": "Zombie 001",
    "__v": 0,
    "resourceVersion": "1",
    "deleteInd": false
  },
  "startTimestamp": "2016-07-15T08:32:01.232Z",
  "status": "ACTIVE",
  "__v": 0,
  "_delegateProfileProviderCodes": [
    "MY_GOV"
  ],
  "_subjectProfileProviderCodes": [
    "ABR"
  ],
  "attributes": [
    {
      "_id": "57889f81fb7ac8d9bcc3f72f",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b0",
        "code": "PERMISSION_CUSTOMISATION_ALLOWED_IND",
        "shortDecodeText": "Permission Customisation Allowed Indicator",
        "longDecodeText": "Permission Customisation Allowed Indicator",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship type allows the user to customise permission levels",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f81fb7ac8d9bcc3f730",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b1",
        "code": "DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND",
        "shortDecodeText": "Do you want this representative to manage authorisations for this organisation?",
        "longDecodeText": "(This includes the ability to create, view, modify and cancel authorisations)",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "BOOLEAN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Indicator of whether a relationship allows the delegate to manage authorisations",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f81fb7ac8d9bcc3f731",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b2",
        "code": "DELEGATE_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Delegate Relationship Type Declaration",
        "longDecodeText": "Delegate Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Delegate specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    },
    {
      "_id": "57889f81fb7ac8d9bcc3f732",
      "value": "true",
      "attributeName": {
        "_id": "57889f80fb7ac8d9bcc3f6b3",
        "code": "SUBJECT_RELATIONSHIP_TYPE_DECLARATION",
        "shortDecodeText": "Subject Relationship Type Declaration",
        "longDecodeText": "Subject Relationship Type Declaration",
        "startDate": "2016-07-15T08:32:00.437Z",
        "domain": "MARKDOWN",
        "classifier": "OTHER",
        "category": null,
        "purposeText": "Subject specific declaration in Markdown for a relationship type",
        "__v": 0,
        "permittedValues": []
      },
      "__v": 0
    }
  ],
  "resourceVersion": "1",
  "deleteInd": false
}
```


[22:50:04] Finished 'export' after 681 ms

