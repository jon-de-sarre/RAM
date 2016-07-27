import {IAgencyUser, AgencyUser, AgencyUserProgramRole} from '../models/agencyUser.model';

// seeder .............................................................................................................

const users: IAgencyUser[] = [

    new AgencyUser(
        'ted_agent',
        'Ted',
        'Agent',
        'Ted Agent',
        [
            new AgencyUserProgramRole('EDUCATION', 'ROLE_ADMIN')
        ]
    ),

    new AgencyUser(
        'max_agent',
        'Max',
        'Agent',
        'Max Agent',
        [
            new AgencyUserProgramRole('TAX', 'ROLE_ADMIN')
        ]
    )

];

export class AgencyUsersSeeder {

    public static findById(id: string): IAgencyUser {
        for (let i = 0; i < users.length; i = i + 1) {
            let user = users[i];
            console.log('Checking: ' + JSON.stringify(user, null, 4));
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