import {connectDisconnectMongo} from './helpers';
import {Seeder} from '../seeding/seed';
import {
    IRole,
    RoleModel
} from '../models/role.model';
import {IRoleType} from '../models/roleType.model';

/* tslint:disable:max-func-body-length */
describe('RAM Role', () => {

    connectDisconnectMongo();

    let roleTypeCustom:IRoleType;

    let role1:IRole;

    beforeEach((done) => {

        Seeder.verbose(false);

        Promise.resolve(null)
            .then()
            .then(Seeder.resetDataInMongo)
            .then(Seeder.loadReference)
            .then(async () => {

                try {

                    roleTypeCustom = Seeder.osp_roleType;

                    role1 = await RoleModel.add(roleTypeCustom,
                        new Date(),
                        null,
                        []
                    );

                } catch (e) {
                    fail(e);
                    done();
                }

            }).then(()=> {
                done();
            });
    });

    it('inserts with no end timestamp', async (done) => {
        try {

            const instance = await RoleModel.create({
                roleType: roleTypeCustom,
                startTimestamp: new Date()
            });

            expect(instance).not.toBeNull();
            expect(instance.id).not.toBeNull();
            expect(instance.endEventTimestamp).toBeFalsy();

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });

    it('inserts with end timestamp', async (done) => {
        try {

            const instance = await RoleModel.create({
                roleType: roleTypeCustom,
                startTimestamp: new Date(),
                endTimestamp: new Date()
            });

            expect(instance).not.toBeNull();
            expect(instance.id).not.toBeNull();
            expect(instance.endEventTimestamp).not.toBeFalsy();

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });

    it('searches successfully', async (done) => {
        try {

            const roles = await RoleModel.search(1, 10);
            expect(roles.totalCount).toBeGreaterThan(0);
            expect(roles.list.length).toBeGreaterThan(0);

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });
});