import {IAgencyUser, IAgencyUserProgramRole} from '../../../commons/RamAPI2';

// seeder .............................................................................................................

const users: IAgencyUser[] = [

    {
        id: 'ted_agency_user',
        givenName: 'Ted',
        familyName: 'Agency User',
        displayName: 'Ted Agency User',
        programRoles: [
            {program: 'EDUCATION', role: 'ROLE_ADMIN'} as IAgencyUserProgramRole
        ]
    } as IAgencyUser,

    {
        id: 'max_agency_user',
        givenName: 'Max',
        familyName: 'Agency User',
        displayName: 'Max Agency User',
        programRoles: [
            {program: 'TAX', role: 'ROLE_ADMIN'} as IAgencyUserProgramRole
        ]
    } as IAgencyUser

];

export class AgencyUsersSeeder {

    public static findById(id: string): IAgencyUser {
        for (let i = 0; i < users.length; i = i + 1) {
            let user = users[i];
            if (user.id === id) {
                return user;
            }
        }
        return null;
    }

}