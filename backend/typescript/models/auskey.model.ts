import {
    AUSkey as AUSkeyDTO
} from '../../../commons/RamAPI';

export interface IAUSkey {
    id: string;
    toDTO(): Promise<AUSkeyDTO>;
}

export class AUSkey implements IAUSkey {

    constructor(public id:string) {
    }

    public toDTO(): Promise<AUSkeyDTO> {
        return Promise.resolve(new AUSkeyDTO(this.id));
    }

}
