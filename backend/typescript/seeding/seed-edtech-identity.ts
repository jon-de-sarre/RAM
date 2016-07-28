import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class EdTechIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Ed Tech Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.edtech_name = await Seeder.createNameModel({
                    unstructuredName: 'Ed Tech Pty Ltd'
                } as any);

                Seeder.edtech_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.edtech_name,
                    sharedSecrets: []
                } as any);

                Seeder.edtech_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.edtech_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: 'edtech_identity_1',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.edtech_profile,
                    party: Seeder.edtech_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
