import {connectDisconnectMongo, resetDataInMongo} from './helpers';
import {IRoleType, RoleTypeModel} from '../models/roleType.model';

/* tslint:disable:max-func-body-length */
describe('RAM Role Type', () => {

    connectDisconnectMongo();
    resetDataInMongo();

    let roleTypeNoEndDate: IRoleType;
    let roleTypeFutureEndDate: IRoleType;
    let roleTypeExpiredEndDate: IRoleType;

    beforeEach(async (done) => {

        try {

            roleTypeNoEndDate = await RoleTypeModel.create({
                code: 'RELATIONSHIP_TYPE_1',
                shortDecodeText: 'Role Type 1',
                longDecodeText: 'Role Type 1',
                startDate: new Date(),
                attributeNameUsages: []
            });

            roleTypeFutureEndDate = await RoleTypeModel.create({
                code: 'RELATIONSHIP_TYPE_2',
                shortDecodeText: 'Role Type 2',
                longDecodeText: 'Role Type 2',
                startDate: new Date(),
                endDate: new Date(2099, 1, 1),
                attributeNameUsages: []
            });

            roleTypeExpiredEndDate = await RoleTypeModel.create({
                code: 'RELATIONSHIP_TYPE_3',
                shortDecodeText: 'Role Type 3',
                longDecodeText: 'Role Type 3',
                startDate: new Date(2016, 1, 1),
                endDate: new Date(2016, 1, 2),
                attributeNameUsages: []
            });

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }

    });

    it('finds in date range with no end date by code', async (done) => {
        try {
            const instance = await RoleTypeModel.findByCodeInDateRange(roleTypeNoEndDate.code, new Date());
            expect(instance).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('finds in date range with future end date by code', async (done) => {
        try {
            const instance = await RoleTypeModel.findByCodeInDateRange(roleTypeFutureEndDate.code, new Date());
            expect(instance).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('finds in date range or invalid by code', async (done) => {
        try {
            const instance = await RoleTypeModel.findByCodeIgnoringDateRange(roleTypeExpiredEndDate.code);
            expect(instance).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails find in date range by non-existent code', async (done) => {
        try {
            const code = '__BOGUS__';
            const instance = await RoleTypeModel.findByCodeInDateRange(code, new Date());
            expect(instance).toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails find not in date range by code', async (done) => {
        try {
            const instance = await RoleTypeModel.findByCodeInDateRange(roleTypeExpiredEndDate.code, new Date());
            expect(instance).toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('lists ignoring date range', async (done) => {
        try {
            const instances = await RoleTypeModel.listIgnoringDateRange();
            expect(instances).not.toBeNull();
            expect(instances.length).toBe(3);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('lists in date range', async (done) => {
        try {
            const instances = await RoleTypeModel.listInDateRange(new Date());
            expect(instances).not.toBeNull();
            expect(instances.length).toBe(2);
            instances.forEach((instance) => {
                expect(instance.startDate.valueOf()).toBeLessThan(new Date().valueOf());
                if (instance.endDate) {
                    expect(instance.endDate.valueOf()).toBeGreaterThan(new Date().valueOf());
                }
            });
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('inserts with valid values', async (done) => {
        try {

            const instance = await RoleTypeModel.create({
                code: 'CODE_1',
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date()
            });

            expect(instance).not.toBeNull();
            expect(instance.id).not.toBeNull();
            expect(instance.code).not.toBeNull();

            const retrievedInstance = await RoleTypeModel.findByCodeInDateRange(instance.code, new Date());
            expect(retrievedInstance).not.toBeNull();
            expect(retrievedInstance.id).toBe(instance.id);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails insert with null code', async (done) => {
        try {
            await RoleTypeModel.create({
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date()
            });
            fail('should not have inserted with null code');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.code).not.toBeNull();
            done();
        }
    });

    it('fails insert with empty code', async (done) => {
        try {
            await RoleTypeModel.create({
                code: '',
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date()
            });
            fail('should not have inserted with empty code');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.code).not.toBeNull();
            done();
        }
    });

    it('fails insert with duplicate code', async (done) => {
        try {

            const code = 'CODE_DUPLICATE';

            await RoleTypeModel.create({
                code: code,
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date()
            });

            await RoleTypeModel.create({
                code: code,
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date()
            });

            fail('should not have inserted with duplicate code');
            done();

        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.code).not.toBeNull();
            expect(e.errors.code.message).toContain('unique');
            done();
        }
    });

});