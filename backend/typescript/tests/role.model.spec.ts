import {connectDisconnectMongo} from './helpers';
import {Seeder} from '../seeding/seed';
import {
    IRole,
    RoleModel,
    RoleStatus
} from '../models/role.model';
import {IRoleType} from '../models/roleType.model';
import {IParty, PartyModel, PartyType} from '../models/party.model';
import {IIdentity, IdentityModel, IdentityType, IdentityLinkIdScheme} from '../models/identity.model';
import {IProfile, ProfileModel, ProfileProvider} from '../models/profile.model';
import {IName, NameModel} from '../models/name.model';

/* tslint:disable:max-func-body-length */
describe('RAM Role', () => {

    connectDisconnectMongo();

    let roleTypeCustom:IRoleType;

    let partyNickName1:IName;
    let partyProfile1:IProfile;
    let party1:IParty;
    let partyIdentity1:IIdentity;

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

                    partyNickName1 = await NameModel.create({
                        givenName: 'Jane',
                        familyName: 'Subject 1'
                    });

                    partyProfile1 = await ProfileModel.create({
                        provider: ProfileProvider.MyGov.code,
                        name: partyNickName1
                    });

                    party1 = await PartyModel.create({
                        partyType: PartyType.Individual.code
                    });

                    partyIdentity1 = await IdentityModel.create({
                        rawIdValue: 'uuid_1',
                        identityType: IdentityType.LinkId.code,
                        defaultInd: true,
                        linkIdScheme: IdentityLinkIdScheme.MyGov.code,
                        profile: partyProfile1,
                        party: party1
                    });

                    role1 = await RoleModel.add(roleTypeCustom,
                        party1,
                        new Date(),
                        null,
                        RoleStatus.Active,
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
                party: party1,
                startTimestamp: new Date(),
                status: RoleStatus.Active.code,
                attributes: []
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
                party: party1,
                startTimestamp: new Date(),
                endTimestamp: new Date(),
                status: RoleStatus.Active.code
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