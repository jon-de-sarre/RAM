import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {RoleStatus} from '../models/role.model';

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

                Seeder.edTech_osp_relationship = await Seeder.createRoleModel({
                    roleType: Seeder.osp_roleType,
                    party: Seeder.edtech_party,
                    startTimestamp: new Date(),
                    status: RoleStatus.Active.code,
                    attributes: [
                        await Seeder.createRoleAttributeModel({
                            value: 'mySSID',
                            attributeName: Seeder.ssid_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: true,
                            attributeName: Seeder.usi_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: 'Here are some notes',
                            attributeName: Seeder.notes_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: 'ted_agent',
                            attributeName: Seeder.creatorId_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: 'Ted Agent',
                            attributeName: Seeder.creatorName_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: 'Department of Education',
                            attributeName: Seeder.creatorAgency_roleAttributeName
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
