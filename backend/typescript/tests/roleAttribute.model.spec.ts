import {connectDisconnectMongo} from './helpers';
import {Seeder} from '../seeding/seed';
import {
    IRole,
    RoleModel
} from '../models/role.model';
import {
    IRoleAttribute,
    RoleAttributeModel
} from '../models/roleAttribute.model';
import {IRoleType} from '../models/roleType.model';

/* tslint:disable:max-func-body-length */
describe('RAM Role Attribute', () => {

    connectDisconnectMongo();

    let roleTypeCustom:IRoleType;

    let role1:IRole;

    let roleAttribute1:IRoleAttribute;

    beforeEach((done) => {

        Seeder.verbose(false);

        Promise.resolve(null)
            .then()
            .then(Seeder.resetDataInMongo)
            .then(Seeder.loadReference)
            .then(async () => {

                try {

                    roleTypeCustom = Seeder.osiUsi_roleType;

                    roleAttribute1 = await RoleAttributeModel.create({
                        value: 'true',
                        attributeName: Seeder.delegateManageAuthorisationAllowedInd_attributeName
                    });

                    role1 = await RoleModel.create({
                        roleType: roleTypeCustom,
                        startTimestamp: new Date(),
                        attributes: [roleAttribute1]
                    });

                } catch (e) {
                    fail('Because ' + e);
                    done();
                }

            }).then(()=> {
                done();
            });
    });

    it('inserts with valid values', async (done) => {
        try {

            const value = 'true';
            const attributeName = Seeder.ssid_roleAttributeName;

            const instance = await RoleAttributeModel.create({
                value: value,
                attributeName: attributeName
            });

            expect(instance).not.toBeNull();
            expect(instance.id).not.toBeNull();
            expect(instance.value).toBe(value);
            expect(instance.attributeName.id).toBe(attributeName.id);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails insert with null attribute name', async (done) => {
        try {
            await RoleAttributeModel.create({
                value: 'true',
                attributeName: null
            });
            fail('should not have inserted with null attribute name');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.attributeName).not.toBeNull();
            done();
        }
    });

});