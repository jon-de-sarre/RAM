import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {RoleStatus} from '../models/role.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class EdTechOspRolesSeeder {

    private static async load_edTech() {
        try {

            Seeder.log('\nInserting Sample Role - Ed Tech OSP:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.edTech_osp_role = await Seeder.createRoleModel({
                    roleType: Seeder.osp_roleType,
                    party: Seeder.edtechosp_party,
                    startTimestamp: Seeder.now,
                    status: RoleStatus.Active.code,
                    attributes: [
                        await Seeder.createRoleAttributeModel({
                            value: ['true'],
                            attributeName: Seeder.ssid_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: ['true'],
                            attributeName: Seeder.usi_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: ['Education Tech'],
                            attributeName: Seeder.preferredName_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: ['ted_agent'],
                            attributeName: Seeder.creatorId_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: ['Ted Agent'],
                            attributeName: Seeder.creatorName_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: ['Department of Education'],
                            attributeName: Seeder.creatorAgency_roleAttributeName
                        } as any),
                        await Seeder.createRoleAttributeModel({
                            value: ['10000000001-DEVICE-0','10000000001-DEVICE-2'],
                            attributeName: Seeder.deviceAuskeys_roleAttributeName
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
        await EdTechOspRolesSeeder.load_edTech();
    }

}
