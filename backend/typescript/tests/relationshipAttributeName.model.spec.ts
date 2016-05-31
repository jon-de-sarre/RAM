import {connectDisconnectMongo, dropMongo} from './helpers';
import {
    IRelationshipAttributeName,
    RelationshipAttributeNameModel,
    RelationshipAttributeNameStringDomain} from '../models/relationshipAttributeName.model';
import {RelationshipAttributeNameUsageModel} from '../models/relationshipAttributeNameUsage.model';
import {IRelationshipType, RelationshipTypeModel} from '../models/relationshipType.model';

/* tslint:disable:max-func-body-length */
describe('RAM Relationship Attribute Name', () => {

    connectDisconnectMongo();
    dropMongo();

    let relationshipAttributeNameNoEndDate: IRelationshipAttributeName;
    let relationshipAttributeNameFutureEndDate: IRelationshipAttributeName;
    let relationshipAttributeNameExpiredEndDate: IRelationshipAttributeName;

    let relationshipType1: IRelationshipType;

    beforeEach(async (done) => {

        try {

            relationshipAttributeNameNoEndDate = await RelationshipAttributeNameModel.create({
                code: 'ATTRIBUTE_NAME_1',
                shortDecodeText: 'Attribute Name',
                longDecodeText: 'Attribute Name',
                startDate: new Date(),
                domain: RelationshipAttributeNameStringDomain,
                purposeText: 'This attribute purpose text'
            });

            relationshipAttributeNameFutureEndDate = await RelationshipAttributeNameModel.create({
                code: 'ATTRIBUTE_NAME_2',
                shortDecodeText: 'Attribute Name',
                longDecodeText: 'Attribute Name',
                startDate: new Date(),
                endDate: new Date(2099, 1, 1),
                domain: RelationshipAttributeNameStringDomain,
                purposeText: 'This attribute purpose text'
            });

            relationshipAttributeNameExpiredEndDate = await RelationshipAttributeNameModel.create({
                code: 'ATTRIBUTE_NAME_3',
                shortDecodeText: 'Attribute Name',
                longDecodeText: 'Attribute Name',
                startDate: new Date(2016, 1, 1),
                endDate: new Date(2016, 1, 2),
                domain: RelationshipAttributeNameStringDomain,
                purposeText: 'This attribute purpose text'
            });

            relationshipType1 = await RelationshipTypeModel.create({
                code: 'RELATIONSHIP_TYPE_1',
                shortDecodeText: 'Relationship Type 1',
                longDecodeText: 'Relationship Type 1',
                startDate: new Date(),
                attributeNameUsages: [
                    await RelationshipAttributeNameUsageModel.create({
                        optionalInd: true,
                        attributeName: relationshipAttributeNameNoEndDate
                    })
                ]
            });

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }

    });

    it('find relationship type with inflated attributes', async (done) => {
        try {
            const instance = await RelationshipTypeModel.findValidByCode(relationshipType1.code);
            expect(instance).not.toBeNull();
            expect(instance.attributeNameUsages.length).toBe(1);
            expect(instance.attributeNameUsages[0].optionalInd).toBe(true);
            expect(instance.attributeNameUsages[0].attributeName.domain).toBe(relationshipAttributeNameNoEndDate.domain);
            expect(instance.attributeNameUsages[0].attributeName.purposeText).toBe(relationshipAttributeNameNoEndDate.purposeText);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('find valid with no end date by code', async (done) => {
        try {
            const instance = await RelationshipAttributeNameModel.findValidByCode(relationshipAttributeNameNoEndDate.code);
            expect(instance).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('find valid or invalid by code', async (done) => {
        try {
            const instance = await RelationshipAttributeNameModel.findByCode(relationshipAttributeNameNoEndDate.code);
            expect(instance).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails find valid by non-existent code', async (done) => {
        try {
            const code = '__BOGUS__';
            const instance = await RelationshipAttributeNameModel.findValidByCode(code);
            expect(instance).toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails find invalid by code', async (done) => {
        try {
            const instance = await RelationshipAttributeNameModel.findValidByCode(relationshipAttributeNameExpiredEndDate.code);
            expect(instance).toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails insert with null code', async (done) => {
        try {
            await RelationshipAttributeNameModel.create({
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                domain: RelationshipAttributeNameStringDomain,
                purposeText: 'This attribute purpose text',
                startDate: new Date()
            });
            fail('should not have inserted with null code');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            done();
        }
    });

    it('fails insert with empty code', async (done) => {
        try {
            await RelationshipAttributeNameModel.create({
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                domain: RelationshipAttributeNameStringDomain,
                purposeText: 'This attribute purpose text',
                startDate: new Date()
            });
            fail('should not have inserted with empty code');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            done();
        }
    });

    it('fails insert with null domain', async (done) => {
        try {
            await RelationshipAttributeNameModel.create({
                code: 'ATTRIBUTE_NAME_X',
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date()
            });
            fail('should not have inserted with null domain');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            done();
        }
    });

    it('fails insert with invalid domain', async (done) => {
        try {
            await RelationshipAttributeNameModel.create({
                code: 'ATTRIBUTE_NAME_X',
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date(),
                domain: '__BOGUS__',
                purposeText: 'This attribute purpose text'
            });
            fail('should not have inserted with invalid domain');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            done();
        }
    });

    it('fails insert with empty purpose text', async (done) => {
        try {
            await RelationshipAttributeNameModel.create({
                code: 'ATTRIBUTE_NAME_X',
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date(),
                domain: RelationshipAttributeNameStringDomain
            });
            fail('should not have inserted with null purpose text');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            done();
        }
    });

    it('fails insert with empty purpose text', async (done) => {
        try {
            await RelationshipAttributeNameModel.create({
                code: 'ATTRIBUTE_NAME_X',
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date(),
                domain: RelationshipAttributeNameStringDomain,
                purposeText: ''
            });
            fail('should not have inserted with empty purpose text');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            done();
        }
    });

    it('fails insert with duplicate code', async (done) => {
        try {

            const code = 'CODE_DUPLICATE';

            await RelationshipAttributeNameModel.create({
                code: code,
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date(),
                domain: RelationshipAttributeNameStringDomain,
                purposeText: 'This attribute purpose text'
            });

            await RelationshipAttributeNameModel.create({
                code: code,
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date(),
                domain: RelationshipAttributeNameStringDomain,
                purposeText: 'This attribute purpose text'
            });

            fail('should not have inserted with duplicate code');
            done();

        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.code.message).toContain('unique');
            done();
        }
    });

});