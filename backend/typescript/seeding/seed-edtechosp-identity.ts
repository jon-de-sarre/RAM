import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityPublicIdentifierScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class EdTechOSPIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Ed Tech OSP Pty Ltd:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.edtechosp_name = await Seeder.createNameModel({
                    unstructuredName: 'Ed Tech OSP Pty Ltd'
                } as any);

                Seeder.edtechosp_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.ABR.code,
                    name: Seeder.edtechosp_name,
                    sharedSecrets: []
                } as any);

                Seeder.edtechosp_party = await Seeder.createPartyModel({
                    partyType: PartyType.ABN.code
                } as any);

                Seeder.log('');

                Seeder.edtechosp_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: '10000000001',
                    identityType: IdentityType.PublicIdentifier.code,
                    defaultInd: true,
                    publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
                    profile: Seeder.edtechosp_profile,
                    party: Seeder.edtechosp_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
