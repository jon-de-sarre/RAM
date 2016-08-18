import {AUSkeyType} from '../models/auskey.model';
import {AUSkeyProvider} from '../providers/auskey.provider';

/* tslint:disable:max-func-body-length */
describe('RAM AUSkey Provider', () => {

    beforeEach(async (done) => {
        done();
    });

    it('gets mock implementation', async (done) => {
        try {
            expect(AUSkeyProvider).not.toBeNull();
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('lists devices by ABN', async (done) => {
        try {
            const auskeys = await AUSkeyProvider.searchByABN('10000000001', AUSkeyType.Device, 1, 50);
            expect(auskeys).not.toBeNull();
            expect(auskeys.list.length).toBe(3);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

});