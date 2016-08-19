import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class TrevorTrainingIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Trevor Training Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.trevortraining_name = await Seeder.createNameModel({
                    unstructuredName: 'Trevor Training Pty Ltd'
                } as any);

                Seeder.trevortraining_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.trevortraining_name,
                    sharedSecrets: []
                } as any);

                Seeder.trevortraining_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.trevortraining_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: '10000000002',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.trevortraining_profile,
                    party: Seeder.trevortraining_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
