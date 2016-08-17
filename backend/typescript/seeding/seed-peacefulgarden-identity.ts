import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class PeacefulGardenIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Peaceful Gardens Organic Cooking School Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.peacefulgarden_name = await Seeder.createNameModel({
                    unstructuredName: 'Peaceful Gardens Organic Cooking School Ltd.'
                } as any);

                Seeder.peacefulgarden_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.peacefulgarden_name,
                    sharedSecrets: []
                } as any);

                Seeder.peacefulgarden_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.peacefulgarden_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: '14126318518',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.peacefulgarden_profile,
                    party: Seeder.peacefulgarden_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
