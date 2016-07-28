import {conf} from '../bootstrap';
import {Seeder} from './seed';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class EdTechRolesSeeder {

    private static async load_edTech() {
        try {

            Seeder.log('\nInserting Sample Role - Ed Tech OSP:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.edTech_osiUsi_relationship = await Seeder.createRoleModel({
                    roleType: Seeder.osp_roleType,
                    party: Seeder.edtech_party,
                    startTimestamp: new Date(),
                    attributes: [
                        await Seeder.createRoleAttributeModel({
                            value: true,
                            attributeName: Seeder.ssid_roleAttributeName
                        } as any)
                    ]
                } as any);

                Seeder.log('');

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }
    public static async load() {
        await EdTechRolesSeeder.load_edTech();
    }

}
