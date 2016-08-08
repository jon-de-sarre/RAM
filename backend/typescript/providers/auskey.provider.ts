import {conf} from '../bootstrap';
import {IAUSkey, AUSkey, AUSkeyType} from '../models/auskey.model';

const useMock = conf.auskeyProviderMock;

const repository: {[key: string]: number} = {
    '10000000001': 3,
    '14126318518': 5
};

export interface IAUSkeyProvider {
    findById(id: string): Promise<IAUSkey>;
    listDevicesByABN(abn: string): Promise<IAUSkey[]>;
}

export class MockAUSkeyProvider implements IAUSkeyProvider {

    public async findById(id: string): Promise<IAUSkey> {
        const abn = id.split('-')[0];
        const ausKeys = await this.listDevicesByABN(abn);
        for (let ausKey of ausKeys) {
            if (ausKey.id === id) {
                return Promise.resolve(ausKey);
            }
        }
        return undefined;
    }

    public listDevicesByABN(abn: string): Promise<IAUSkey[]> {
        let abnScrubbed = abn.replace(/ /g, '');
        let numberOfKeys = repository[abnScrubbed];
        if (!numberOfKeys) {
            numberOfKeys = 0;
        }
        let auskeys: IAUSkey[] = [];
        for (let i = 0; i < numberOfKeys; i = i + 1) {
            let id = abn + '-device-' + (i + 1);
            auskeys.push(new AUSkey(id, AUSkeyType.Device));
        }
        return Promise.resolve(auskeys);
    }

}

export class RealAUSkeyProvider implements IAUSkeyProvider {

    public findById(id: string): Promise<IAUSkey> {
        throw new Error('Not yet implemented');
    }

    public listDevicesByABN(abn: string): Promise<IAUSkey[]> {
        throw new Error('Not yet implemented');
    }

}

export const AUSkeyProvider = (useMock ? new MockAUSkeyProvider() : new RealAUSkeyProvider()) as IAUSkeyProvider;
