import {AUSkeyProvider} from '../providers/auskey.provider';

/* tslint:disable:max-func-body-length */
describe('RAM AUSkey Provider', () => {

    beforeEach(async (done) => {
        done();
    });

    it('gets mock implementation', async (done) => {
        try {
            const provider = AUSkeyProvider;
            expect(provider).not.toBeNull();
            //expect(provider).toBe(MockAUSkeyProvider);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('lists devices by ABN', async (done) => {
        try {
            const auskeys = AUSkeyProvider.listDevicesByABN('10000000001');
            expect(auskeys).not.toBeNull();
            expect(auskeys.length).toBe(3);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

});