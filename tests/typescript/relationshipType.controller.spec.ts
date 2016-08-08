import RelationshipTypeHelper from './helpers/relationshipTypeHelper';
import InitializationHelper from './helpers/initializationHelper';
import AuthHelper from './helpers/authHelper';

const relationshipTypeHelper = new RelationshipTypeHelper();
const initializationHelper = new InitializationHelper();
const authHelper = new AuthHelper();

/* tslint:disable:max-func-body-length */
describe('RelationshipType API', () => {

    beforeAll(async(done) => {
        try {
            await initializationHelper.loadData();
            await authHelper.logIn(authHelper.KNOWN_IDENTITIES['jenscatering_identity_1']);
        } catch (e) {
            fail(e);
        }
        done();
    });

    afterAll((done) => {
        done();
    });

    it('can find by code', async(done) => {

        const code = 'CUSTOM_REPRESENTATIVE';

        try {
            const response = await relationshipTypeHelper.findByCode(code);
            const relationshipType = response.body;

            relationshipTypeHelper.validateRelationshipType(relationshipType);

            expect(relationshipType.code).toBe(code);
            expect(relationshipType.shortDecodeText).toBe('Custom Representative');
        } catch (e) {
            fail(e);
        }

        done();
    });

    it('returns 404 for unknown code', async(done) => {

        const code = 'NOT_FOUND';

        relationshipTypeHelper.findByCode(code)
            .then((response) => {
                fail('Expected 404');
                done();
            })
            .catch((err) => {
                expect(err.status).toBe(404);
                done();
            });
    });

    it('can list current', async(done) => {

        relationshipTypeHelper.listAllCurrent()
            .then((response) => {

                const relationshipTypeList = response.body;

                expect(relationshipTypeList.length > 0).toBeTruthy();
                for (let item of relationshipTypeList) {
                    relationshipTypeHelper.validateRelationshipType(item.value);
                }
                done();
            })
            .catch((err) => {
                fail('Error encountered ' + err);
                done();
            });
    });

    // TODO create

    // TODO update

});