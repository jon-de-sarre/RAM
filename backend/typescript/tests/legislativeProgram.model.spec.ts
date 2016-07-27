import {connectDisconnectMongo, resetDataInMongo} from './helpers';
import {
    ILegislativeProgram,
    LegislativeProgramModel} from '../models/legislativeProgram.model';

/* tslint:disable:max-func-body-length */
describe('RAM Legislative Program', () => {

    connectDisconnectMongo();
    resetDataInMongo();

    let legislativeProgramNoEndDate: ILegislativeProgram;
    let legislativeProgramFutureEndDate: ILegislativeProgram;
    let legislativeProgramExpiredEndDate: ILegislativeProgram;

    beforeEach(async (done) => {

        try {

            legislativeProgramNoEndDate = await LegislativeProgramModel.create({
                code: 'LEGISLATIVE_PROGRAM_1',
                shortDecodeText: 'Legislative Program',
                longDecodeText: 'Legislative Program',
                startDate: new Date()
            });

            legislativeProgramFutureEndDate = await LegislativeProgramModel.create({
                code: 'LEGISLATIVE_PROGRAM_2',
                shortDecodeText: 'Legislative Program',
                longDecodeText: 'Legislative Program',
                startDate: new Date(),
                endDate: new Date(2099, 1, 1)
            });

            legislativeProgramExpiredEndDate = await LegislativeProgramModel.create({
                code: 'LEGISLATIVE_PROGRAM_3',
                shortDecodeText: 'Legislative Program',
                longDecodeText: 'Legislative Program',
                startDate: new Date(2016, 1, 1),
                endDate: new Date(2016, 1, 2)
            });

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }

    });

    it('finds in date range with no end date by code', async (done) => {
        try {
            const instance = await LegislativeProgramModel.findByCodeInDateRange(legislativeProgramNoEndDate.code, new Date());
            expect(instance).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('finds in date range or invalid by code', async (done) => {
        try {
            const instance = await LegislativeProgramModel.findByCodeIgnoringDateRange(
                legislativeProgramNoEndDate.code);
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
            const instance = await LegislativeProgramModel.findByCodeInDateRange(code, new Date());
            expect(instance).toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails find not in date range by code', async (done) => {
        try {
            const instance = await LegislativeProgramModel.findByCodeInDateRange(legislativeProgramExpiredEndDate.code, new Date());
            expect(instance).toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('lists ignoring date range', async (done) => {
        try {
            const instances = await LegislativeProgramModel.listIgnoringDateRange();
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
            const instances = await LegislativeProgramModel.listInDateRange(new Date());
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

    it('fails insert with null code', async (done) => {
        try {
            await LegislativeProgramModel.create({
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
            await LegislativeProgramModel.create({
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

            await LegislativeProgramModel.create({
                code: code,
                shortDecodeText: 'Some short decode text',
                longDecodeText: 'Some long decode text',
                startDate: new Date()
            });

            await LegislativeProgramModel.create({
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