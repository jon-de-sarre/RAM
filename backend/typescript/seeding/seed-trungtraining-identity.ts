import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class TrungTrainingIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Trung Training Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.trungtraining_name = await Seeder.createNameModel({
                    unstructuredName: 'Trung Training Pty Ltd'
                } as any);

                Seeder.trungtraining_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.trungtraining_name,
                    sharedSecrets: []
                } as any);

                Seeder.trungtraining_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.trungtraining_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: '10000000003',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.trungtraining_profile,
                    party: Seeder.trungtraining_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
