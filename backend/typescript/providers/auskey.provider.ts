import {conf} from '../bootstrap';
import {IAUSkey, AUSkey, AUSkeyType} from '../models/auskey.model';

const useMock = conf.auskeyProviderMock;

const repository: {[key: string]: number} = {
    '10000000001': 3,
    '14126318518': 5
};

export interface IAUSkeyProvider {
    listDevicesByABN(abn: string): Promise<IAUSkey[]>;
}

export class MockAUSkeyProvider implements IAUSkeyProvider {

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

    public listDevicesByABN(abn: string): Promise<IAUSkey[]> {
        throw new Error('Not yet implemented');
    }

}

export const AUSkeyProvider = (useMock ? new MockAUSkeyProvider() : new RealAUSkeyProvider()) as IAUSkeyProvider;
