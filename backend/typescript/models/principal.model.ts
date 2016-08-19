import {IAgencyUser} from './agencyUser.model';
import {IIdentity} from './identity.model';
import {Principal as PrincipalDTO} from '../../../commons/RamAPI';

export interface IPrincipal {
    id: string;
    displayName: string;
    agencyUserInd: boolean;
    agencyUser?: IAgencyUser;
    identity?: IIdentity;
    toDTO(): Promise<PrincipalDTO>;
}

export class Principal implements IPrincipal {

    constructor(public id: string,
                public displayName: string,
                public agencyUserInd: boolean,
                public agencyUser?: IAgencyUser,
                public identity?: IIdentity) {
    }

    public async toDTO(): Promise<PrincipalDTO> {
        return Promise.resolve(new PrincipalDTO(
            this.id,
            this.displayName,
            this.agencyUserInd,
            this.agencyUser ? await this.agencyUser.toDTO() : undefined,
            this.identity ? await this.identity.toDTO() : undefined
        ));
    }

}
