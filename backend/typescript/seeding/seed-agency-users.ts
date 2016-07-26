import {IAgencyUser, IAgencyUserProgramRole} from '../../../commons/RamAPI2';

// seeder .............................................................................................................

const users: IAgencyUser[] = [

    {
        id: 'ted_agent',
        givenName: 'Ted',
        familyName: 'Agent',
        displayName: 'Ted Agent',
        programRoles: [
            {program: 'EDUCATION', role: 'ROLE_ADMIN'} as IAgencyUserProgramRole
        ]
    } as IAgencyUser,

    {
        id: 'max_agent',
        givenName: 'Max',
        familyName: 'Agent',
        displayName: 'Max Agent',
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

    public static all(): IAgencyUser[] {
        return users;
    }

}