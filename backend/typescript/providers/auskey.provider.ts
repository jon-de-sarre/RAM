import {conf} from '../bootstrap';

// Mock data is used if the GUID is empty.
const useMock = conf.auskeyProviderMock;

export interface IAUSkeyProvider {
}

export class MockAUSkeyProvider implements IAUSkeyProvider {
}

export class RealAUSkeyProvider implements IAUSkeyProvider {
}

export const AUSkeyProvider = (useMock ? MockAUSkeyProvider : RealAUSkeyProvider) as IAUSkeyProvider;
