import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class JMFoodPackagingIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - J&M Food Packaging Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.jmfoodpackaging_name = await Seeder.createNameModel({
                    unstructuredName: 'J&M Food Packaging Pty Ltd'
                } as any);

                Seeder.jmfoodpackaging_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.jmfoodpackaging_name,
                    sharedSecrets: []
                } as any);

                Seeder.jmfoodpackaging_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.jmfoodpackaging_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: '00000000003',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.jmfoodpackaging_profile,
                    party: Seeder.jmfoodpackaging_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
