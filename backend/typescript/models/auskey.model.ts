import {AUSkey as AUSkeyDTO} from '../../../commons/RamAPI';
import {RAMEnum} from './base';

// enums, utilities, helpers ..........................................................................................

export class AUSkeyType extends RAMEnum {

    public static Standard = new AUSkeyType('STANDARD', 'Standard');
    public static Administrator = new AUSkeyType('ADMINISTRATOR', 'Administrator');
    public static Device = new AUSkeyType('DEVICE', 'Device');

    protected static AllValues = [
        AUSkeyType.Standard,
        AUSkeyType.Administrator,
        AUSkeyType.Device
    ];

    constructor(code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
    }
}

// interfaces .........................................................................................................

export interface IAUSkey {
    id: string;
    auskeyType: AUSkeyType;
    toDTO(): Promise<AUSkeyDTO>;
}

// concrete model .....................................................................................................

export class AUSkey implements IAUSkey {

    constructor(public id: string,
                public auskeyType: AUSkeyType) {
    }

    public toDTO(): Promise<AUSkeyDTO> {
        return Promise.resolve(new AUSkeyDTO(this.id, this.auskeyType.code));
    }

}
