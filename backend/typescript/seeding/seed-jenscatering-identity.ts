import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class JensCateringIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Jen\'s Catering Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.jenscatering_name = await Seeder.createNameModel({
                    unstructuredName: 'Jen\'s Catering Pty Ltd'
                } as any);

                Seeder.jenscatering_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.jenscatering_name,
                    sharedSecrets: []
                } as any);

                Seeder.jenscatering_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.jenscatering_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: '00000000001',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.jenscatering_profile,
                    party: Seeder.jenscatering_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
