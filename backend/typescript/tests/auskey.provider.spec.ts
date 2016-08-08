import {connectDisconnectMongo, resetDataInMongo} from './helpers';
import {AUSkeyProvider} from '../providers/auskey.provider';

/* tslint:disable:max-func-body-length */
describe('RAM AUSkey Provider', () => {

    connectDisconnectMongo();
    resetDataInMongo();

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

});