import {
    Principal as PrincipalDTO
} from '../../../commons/RamAPI';

export interface IPrincipal {
    id: string;
    displayName: string;
    agencyUserInd: boolean;
    toDTO(): Promise<PrincipalDTO>;
}

export class Principal implements IPrincipal {

    constructor(public id:string,
                public displayName:string,
                public agencyUserInd:boolean) {
    }

    public toDTO(): Promise<PrincipalDTO> {
        return Promise.resolve(new PrincipalDTO(
            this.id,
            this.displayName,
            this.agencyUserInd
        ));
    }

}
