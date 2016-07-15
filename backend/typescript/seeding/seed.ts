import * as mongoose from 'mongoose';
import * as colors from 'colors';
import {conf} from '../bootstrap';
import {doResetDataInMongo} from '../resetDataInMongo';

import {
    IRelationshipAttributeName,
    RelationshipAttributeNameModel,
    RelationshipAttributeNameDomain,
    RelationshipAttributeNameClassifier} from '../models/relationshipAttributeName.model';

import {
    IRelationshipAttributeNameUsage,
    RelationshipAttributeNameUsageModel} from '../models/relationshipAttributeNameUsage.model';

import {
    IRelationshipType,
    RelationshipTypeModel} from '../models/relationshipType.model';

import {
    ISharedSecretType,
    SharedSecretTypeModel,
    DOB_SHARED_SECRET_TYPE_CODE} from '../models/sharedSecretType.model';

import {
    ISharedSecret,
    SharedSecretModel} from '../models/sharedSecret.model';

import {
    IName,
    NameModel} from '../models/name.model';

import {
    IProfile,
    ProfileModel} from '../models/profile.model';

import {
    IParty,
    PartyModel} from '../models/party.model';

import {
    IRelationship,
    RelationshipModel} from '../models/relationship.model';

import {
    IRelationshipAttribute,
    RelationshipAttributeModel} from '../models/relationshipAttribute.model';

import {
    IIdentity,
    IdentityModel} from '../models/identity.model';

import {BobSmithIdentitySeeder} from './seed-bobsmith-identity';

import {CakeryBakeryIdentitySeeder} from './seed-cakerybakery-identity';
import {CakeryBakeryRelationshipsSeeder} from './seed-cakerybakery-relationships';

import {JMFoodPackagingIdentitySeeder} from './seed-jmfoodpackaging-identity';
import {JMFoodPackagingRelationshipsSeeder} from './seed-jmfoodpackaging-relationships';

import {JenniferMaximsIdentitySeeder} from './seed-jennifermaxims-identity';

import {JohnMaximsIdentitySeeder} from './seed-johnmaxims-identity';

import {JensCateringIdentitySeeder} from './seed-jenscatering-identity';
import {JensCateringRelationshipsSeeder} from './seed-jenscatering-relationships';

const now = new Date();

const truncateString = (input:String):String => {
    return input && input.length > 20 ? (input.substring(0, 20) + '...') : input;
};

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class Seeder {
    private static verboseMode:boolean = true;

    public static permissionCustomisationAllowedInd_attributeName:IRelationshipAttributeName;
    public static delegateManageAuthorisationAllowedInd_attributeName:IRelationshipAttributeName;
    public static delegateRelationshipTypeDeclaration_attributeName:IRelationshipAttributeName;
    public static subjectRelationshipTypeDeclaration_attributeName:IRelationshipAttributeName;

    public static asic_abn_attributeName:IRelationshipAttributeName;
    public static wgea_activate_attributeName:IRelationshipAttributeName;
    public static deptindustry_aba_attributeName:IRelationshipAttributeName;
    public static abr_abr_attributeName:IRelationshipAttributeName;
    public static deptindustry_ats_attributeName:IRelationshipAttributeName;
    public static ntdeptbusiness_avetmiss_attributeName:IRelationshipAttributeName;
    public static ntdeptcorpinfoservices_ims_attributeName:IRelationshipAttributeName;
    public static depthscentrelink_ppl_attributeName:IRelationshipAttributeName;
    public static deptimm_skillselect_attributeName:IRelationshipAttributeName;
    public static deptemp_wageconnect_attributeName:IRelationshipAttributeName;

    public static full_accessLevel = 'Full access';
    public static accessLevels = [Seeder.full_accessLevel, 'Limited access', 'No access'];

    public static associate_delegate_relationshipType:IRelationshipType;
    public static universal_delegate_relationshipType:IRelationshipType;
    public static custom_delegate_relationshipType:IRelationshipType;

    public static dob_sharedSecretType:ISharedSecretType;

    // individual identity
    public static bobsmith_name:IName;
    public static bobsmith_dob:ISharedSecret;
    public static bobsmith_profile:IProfile;
    public static bobsmith_party:IParty;
    public static bobsmith_identity_1:IIdentity;

    // ABN identity
    public static cakerybakery_name:IName;
    public static cakerybakery_profile:IProfile;
    public static cakerybakery_party:IParty;
    public static cakerybakery_identity_1:IIdentity;

    // ABN identity
    public static jenscatering_name:IName;
    public static jenscatering_profile:IProfile;
    public static jenscatering_party:IParty;
    public static jenscatering_identity_1:IIdentity;

    // individual identity
    public static jmfoodpackaging_name:IName;
    public static jmfoodpackaging_profile:IProfile;
    public static jmfoodpackaging_party:IParty;
    public static jmfoodpackaging_identity_1:IIdentity;

    // individual identity
    public static jennifermaxims_name:IName;
    public static jennifermaxims_dob:ISharedSecret;
    public static jennifermaxims_profile:IProfile;
    public static jennifermaxims_party:IParty;
    public static jennifermaxims_identity_1:IIdentity;

    // individual identity
    public static johnmaxims_name:IName;
    public static johnmaxims_dob:ISharedSecret;
    public static johnmaxims_profile:IProfile;
    public static johnmaxims_party:IParty;
    public static johnmaxims_identity_1:IIdentity;

    // invitation identity
    public static robertsmith_name:IName;
    public static robertsmith_dob:ISharedSecret;
    public static robertsmith_profile:IProfile;
    public static robertsmith_party:IParty;
    public static robertsmith_identity_1:IIdentity;

    // invitation identity
    public static fredjohnson_name:IName;
    public static fredjohnson_dob:ISharedSecret;
    public static fredjohnson_profile:IProfile;
    public static fredjohnson_party:IParty;
    public static fredjohnson_identity_1:IIdentity;

    // relationships
    public static cakerybakery_and_jennifermaxims_relationship:IRelationship;
    public static jenscatering_and_jennifermaxims_relationship:IRelationship;
    public static jenscatering_and_johnmaxims_relationship:IRelationship;
    public static jenscatering_and_robertsmith_relationship:IRelationship;
    public static jenscatering_and_fredjohnson_relationship:IRelationship;
    public static jmfoodpackaging_and_jenscatering_relationship:IRelationship;

    public static log(msg:String) {
        if(Seeder.verboseMode) {
            console.log(msg);
        }
    }

    public static async connectMongo() {
        await mongoose.connect(conf.mongoURL);
        Seeder.log(`\nConnected to the db: ${conf.mongoURL}`);
    }

    public static async resetDataInMongo() {
        if (conf.devMode) {
            Seeder.log('Dropping database in dev mode (starting fresh)');
            await doResetDataInMongo();
        } else {
            Seeder.log('Not dropping database in prod mode (appending)');
        }
    }

    public static async disconnect() {
        mongoose.connection.close();
    }

    public static verbose(verbose:boolean) {
        Seeder.verboseMode = verbose;
    }

    public static async createRelationshipAttributeNameModel(values:IRelationshipAttributeName) {
        const code = values.code;
        const existingModel = await RelationshipAttributeNameModel.findByCodeIgnoringDateRange(code);
        if (existingModel === null) {
            Seeder.log(`- ${code}`.green);
            if (values.permittedValues) {
                for (let permittedValue of values.permittedValues) {
                    Seeder.log(colors.gray(`  - ${permittedValue}`));
                }
            }
            const model = await RelationshipAttributeNameModel.create(values);
            return model;
        } else {
            Seeder.log(`- ${code} ... skipped`.green);
            return existingModel;
        }
    }

    public static async createRelationshipAttributeNameUsageModels
    <T extends { attribute:IRelationshipAttributeName, optionalInd:boolean, defaultValue:string}>(attributeValues:T[]) {
        const attributeNameUsages:IRelationshipAttributeNameUsage[] = [];
        if (attributeValues) {
            for (let i = 0; i < attributeValues.length; i = i + 1) {
                const attributeValue = attributeValues[i];
                const truncatedDefaultValue = truncateString(attributeValue.defaultValue);
                Seeder.log(`  - ${attributeValue.attribute.code} (${truncatedDefaultValue})`.green);
                const attributeNameUsage = await RelationshipAttributeNameUsageModel.create({
                    attributeName: attributeValue.attribute,
                    optionalInd: attributeValue.optionalInd,
                    defaultValue: attributeValue.defaultValue
                });
                attributeNameUsages.push(attributeNameUsage);
            }
        }
        return attributeNameUsages;
    }

    public static async createRelationshipTypeModel
    <T extends { attribute:IRelationshipAttributeName, optionalInd:boolean, defaultValue:string}>
    (values:IRelationshipType, attributeValues:T[]) {
        const code = values.code;
        const existingModel = await RelationshipTypeModel.findByCodeIgnoringDateRange(code);
        if (existingModel === null) {
            Seeder.log(`- ${code}`.magenta);
            values.attributeNameUsages = await Seeder.createRelationshipAttributeNameUsageModels(attributeValues);
            const model = await RelationshipTypeModel.create(values);
            Seeder.log('');
            return model;
        } else {
            Seeder.log(`- ${code} ... skipped`.magenta);
            return existingModel;
        }
    }

    public static async createSharedSecretTypeModel(values:ISharedSecretType) {
        const code = values.code;
        const existingModel = await SharedSecretTypeModel.findByCodeIgnoringDateRange(code);
        if (existingModel === null) {
            Seeder.log(`- ${code}`.red);
            const model = await SharedSecretTypeModel.create(values);
            return model;
        } else {
            Seeder.log(`- ${code} ...`.red);
            return existingModel;
        }
    }

    public static async createSharedSecretModel(values:ISharedSecret) {
        Seeder.log(`- Secret    : ${values.sharedSecretType.code} (${values.value})`.cyan);
        const model = await SharedSecretModel.create(values);
        return model;
    }

    public static async createNameModel(values:IName) {
        if (values.givenName || values.familyName) {
            Seeder.log(`- Name      : ${values.givenName} ${values.familyName}`.cyan);
        } else {
            Seeder.log(`- Name      : ${values.unstructuredName}`.cyan);
        }
        const model = await NameModel.create(values);
        return model;
    } 

    public static async createProfileModel(values:IProfile) {
        Seeder.log(`- Profile   : ${values.provider}`.cyan);
        const model = await ProfileModel.create(values);
        return model;
    }

    public static async createPartyModel(values:IParty) {
        Seeder.log(`- Party     : ${values.partyType}`.cyan);
        const model = await PartyModel.create(values);
        return model;
    }

    public static async createIdentityModel(values:IIdentity) {
        const model = await IdentityModel.create(values);
        Seeder.log(`- Identity  : ${model.idValue}`.cyan);
        return model;
    }

    public static async createRelationshipAttributeModel(values:IRelationshipAttribute) {
        const model = await RelationshipAttributeModel.create(values);
        return model;
    }

    public static async createRelationshipModel(values:IRelationship) {
        Seeder.log(`- ${values.relationshipType.code}`.magenta);
        if (values.attributes) {
            for (let attribute of values.attributes) {
                const truncatedValue = truncateString(attribute.value);
                Seeder.log(`  - ${attribute.attributeName.code} (${truncatedValue})`.green);
            }
        }
        if (values.subjectNickName.givenName || values.subjectNickName.familyName) {
            Seeder.log(`  - Subject   : ${values.subjectNickName.givenName} ${values.subjectNickName.familyName}`.cyan);
        } else {
            Seeder.log(`  - Subject   : ${values.subjectNickName.unstructuredName}`.cyan);
        }
        if (values.subjectNickName.givenName || values.delegateNickName.familyName) {
            Seeder.log(`  - Delegate  : ${values.delegateNickName.givenName} ${values.delegateNickName.familyName}`.cyan);
        } else {
            Seeder.log(`  - Delegate  : ${values.delegateNickName.unstructuredName}`.cyan);
        }
        Seeder.log(`  - Start At  : ${values.startTimestamp}`.cyan);
        Seeder.log(`  - Status    : ${values.status}`.cyan);
        const model = await RelationshipModel.create(values);
        return model;
    }

    public static async loadRelationshipOtherAttributeNames() {
        try {

            Seeder.log('\nInserting Relationship Attribute Names (other):\n'.underline);

            Seeder.permissionCustomisationAllowedInd_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'PERMISSION_CUSTOMISATION_ALLOWED_IND',
                shortDecodeText: 'Permission Customisation Allowed Indicator',
                longDecodeText: 'Permission Customisation Allowed Indicator',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Boolean.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Indicator of whether a relationship type allows the user to customise permission levels'
            } as any);

            Seeder.delegateManageAuthorisationAllowedInd_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND',
                shortDecodeText: 'Do you want this representative to manage authorisations for this organisation?',
                longDecodeText: '(This includes the ability to create, view, modify and cancel authorisations)',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Boolean.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Indicator of whether a relationship allows the delegate to manage authorisations'
            } as any);

            Seeder.delegateRelationshipTypeDeclaration_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DELEGATE_RELATIONSHIP_TYPE_DECLARATION',
                shortDecodeText: 'Delegate Relationship Type Declaration',
                longDecodeText: 'Delegate Relationship Type Declaration',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Markdown.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Delegate specific declaration in Markdown for a relationship type'
            } as any);

            Seeder.subjectRelationshipTypeDeclaration_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'SUBJECT_RELATIONSHIP_TYPE_DECLARATION',
                shortDecodeText: 'Subject Relationship Type Declaration',
                longDecodeText: 'Subject Relationship Type Declaration',
                startDate: now,
                domain: RelationshipAttributeNameDomain.Markdown.name,
                classifier: RelationshipAttributeNameClassifier.Other.name,
                category: null,
                purposeText: 'Subject specific declaration in Markdown for a relationship type'
            } as any);

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

    public static async loadRelationshipPermissionAttributeNames() {
        try {

            Seeder.log('\nInserting Relationship Attribute Names (permission):\n'.underline);

            const administrativeServices_category = 'Administrative Services';

            Seeder.asic_abn_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'ASIC_ABN_PERMISSION',
                shortDecodeText: 'Australian Securities and Investments Commission (ASIC)',
                longDecodeText: 'ABN / BN Project (limited release)',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.wgea_activate_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'WGEA_ACTIVATE_PERMISSION',
                shortDecodeText: 'Workplace Gender Equality Agency (WGEA)',
                longDecodeText: 'Activate',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.deptindustry_aba_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFINDUSTRY_ABA_PERMISSION',
                shortDecodeText: 'Department of Industry',
                longDecodeText: 'Australian Business Account (ABA) - ABLIS',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.abr_abr_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'ABR_ABR_PERMISSION',
                shortDecodeText: 'Australian Business Register (ABR)',
                longDecodeText: 'Australian Business Register',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.deptindustry_ats_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFINDUSTRY_ATS_PERMISSION',
                shortDecodeText: 'Department of Industry',
                longDecodeText: 'Automotive Transformation Scheme (ATS)',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.ntdeptbusiness_avetmiss_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'NTDEPTOFBUSINESS_AVETMISS_PERMISSION',
                shortDecodeText: 'NT Department of Business',
                longDecodeText: 'AVETMISS Training Portal',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.ntdeptcorpinfoservices_ims_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'NTDEPTOFCORPINFOSERVICES_IMS_PERMISSION',
                shortDecodeText: 'NT Department of Corporate & Information Services - DCIS',
                longDecodeText: 'Identity Management System (IMS) - Invoice Portal – Invoice NTG',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.depthscentrelink_ppl_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFHUMANSERVICESCENTRELINK_PPL_PERMISSION',
                shortDecodeText: 'Department of Human Services - Centrelink',
                longDecodeText: 'Paid Parental Leave',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.deptimm_skillselect_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTOFIMMIGRATION_SKILLSELECT_PERMISSION',
                shortDecodeText: 'Department of Immigration and Border Protection',
                longDecodeText: 'Skill Select',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

            Seeder.deptemp_wageconnect_attributeName = await Seeder.createRelationshipAttributeNameModel({
                code: 'DEPTEMPLOYMENT_WAGECONNECT_PERMISSION',
                shortDecodeText: 'Department of Employment',
                longDecodeText: 'Wage Connect',
                startDate: now,
                domain: RelationshipAttributeNameDomain.SelectSingle.name,
                classifier: RelationshipAttributeNameClassifier.Permission.name,
                category: administrativeServices_category,
                purposeText: 'A permission for a relationship',
                permittedValues: Seeder.accessLevels
            } as any);

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

    public static async loadRelationshipTypes() {
        try {

            Seeder.log('\nInserting Relationship Types:\n'.underline);

            Seeder.associate_delegate_relationshipType = await Seeder.createRelationshipTypeModel({
                code: 'ASSOCIATE',
                shortDecodeText: 'Associate',
                longDecodeText: 'Associate',
                startDate: now
            } as any, [
                {attribute: Seeder.permissionCustomisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateManageAuthorisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Delegate Universal Representative Declaration'},
                {attribute: Seeder.subjectRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: `# This is declaration text

* written in markdown
* kept in database
* relationshipTypeUsage.defaultValue
* Use seed or admin UI to change it
                    `},
                {attribute: Seeder.asic_abn_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.wgea_activate_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptindustry_aba_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.abr_abr_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptindustry_ats_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.ntdeptbusiness_avetmiss_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.ntdeptcorpinfoservices_ims_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.depthscentrelink_ppl_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptimm_skillselect_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptemp_wageconnect_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel}
            ]);

            Seeder.universal_delegate_relationshipType = await Seeder.createRelationshipTypeModel({
                code: 'UNIVERSAL_REPRESENTATIVE',
                shortDecodeText: 'Universal Representative',
                longDecodeText: 'Universal Representative',
                startDate: now
            } as any, [
                {attribute: Seeder.permissionCustomisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateManageAuthorisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Delegate Universal Representative Declaration'},
                {attribute: Seeder.subjectRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Subject Universal Representative Declaration'},
                {attribute: Seeder.asic_abn_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.wgea_activate_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptindustry_aba_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.abr_abr_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptindustry_ats_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.ntdeptbusiness_avetmiss_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.ntdeptcorpinfoservices_ims_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.depthscentrelink_ppl_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptimm_skillselect_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel},
                {attribute: Seeder.deptemp_wageconnect_attributeName, optionalInd: false, defaultValue: Seeder.full_accessLevel}
            ]);

            Seeder.custom_delegate_relationshipType = await Seeder.createRelationshipTypeModel({
                code: 'CUSTOM_REPRESENTATIVE',
                shortDecodeText: 'Custom Representative',
                longDecodeText: 'Custom Representative',
                startDate: now
            } as any, [
                {attribute: Seeder.permissionCustomisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'true'},
                {attribute: Seeder.delegateManageAuthorisationAllowedInd_attributeName, optionalInd: false, defaultValue: 'false'},
                {attribute: Seeder.delegateRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Delegate Custom Representative Declaration'},
                {attribute: Seeder.subjectRelationshipTypeDeclaration_attributeName, optionalInd: false,
                    defaultValue: 'Markdown for Subject Custom Representative Declaration'},
                {attribute: Seeder.asic_abn_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.wgea_activate_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptindustry_aba_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.abr_abr_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptindustry_ats_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.ntdeptbusiness_avetmiss_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.ntdeptcorpinfoservices_ims_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.depthscentrelink_ppl_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptimm_skillselect_attributeName, optionalInd: false, defaultValue: null},
                {attribute: Seeder.deptemp_wageconnect_attributeName, optionalInd: false, defaultValue: null}
            ]);

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

    public static async loadSharedSecretTypes() {
        try {

            Seeder.log('\nInserting Shared Secret Types:\n'.underline);

            Seeder.dob_sharedSecretType = await Seeder.createSharedSecretTypeModel({
                code: DOB_SHARED_SECRET_TYPE_CODE,
                shortDecodeText: 'Date of Birth',
                longDecodeText: 'Date of Birth',
                startDate: now,
                domain: 'DEFAULT'
            } as any);

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

    public static reload() {
        return Seeder.connectMongo()
            .then(Seeder.resetDataInMongo)
            .then(Seeder.loadReference)
            .then(Seeder.loadMock)
            .then(Seeder.disconnect);
    }

    public static loadReference() {
        return Promise.resolve(null)
            .then(Seeder.loadRelationshipOtherAttributeNames)
            .then(Seeder.loadRelationshipPermissionAttributeNames)
            .then(Seeder.loadRelationshipTypes)
            .then(Seeder.loadSharedSecretTypes);
    }

    public static loadMock() {

        return Promise.resolve(null)

            // identities
            .then(BobSmithIdentitySeeder.load)
            .then(CakeryBakeryIdentitySeeder.load)
            .then(JenniferMaximsIdentitySeeder.load)
            .then(JohnMaximsIdentitySeeder.load)
            .then(JMFoodPackagingIdentitySeeder.load)
            .then(JensCateringIdentitySeeder.load)

            // relationships
            .then(CakeryBakeryRelationshipsSeeder.load)
            .then(JensCateringRelationshipsSeeder.load)
            .then(JMFoodPackagingRelationshipsSeeder.load);

    }

}