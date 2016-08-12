import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class CakeryBakeryIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Cakery Bakery Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.cakerybakery_name = await Seeder.createNameModel({
                    unstructuredName: 'Cakery Bakery Pty Ltd'
                } as any);

                Seeder.cakerybakery_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.cakerybakery_name,
                    sharedSecrets: []
                } as any);

                Seeder.cakerybakery_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.cakerybakery_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: '00000000002',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.cakerybakery_profile,
                    party: Seeder.cakerybakery_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
