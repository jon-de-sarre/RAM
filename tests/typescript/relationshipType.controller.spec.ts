import RelationshipTypeHelper from './helpers/relationshipTypeHelper';
import InitializationHelper from './helpers/initializationHelper';

const relationshipTypeHelper = new RelationshipTypeHelper();
const initializationHelper = new InitializationHelper();

/* tslint:disable:max-func-body-length */
describe('RelationshipType API', () => {

    beforeAll(async(done) => {
        try {
            await initializationHelper.loadData();
        } catch (e) {
            fail(e);
        }
        done();
    });

    afterAll((done) => {
        done();
    });

    it('can find by code', async(done) => {

        const code = 'BUSINESS_REPRESENTATIVE';

        try {

            const response = await relationshipTypeHelper.findByCode(code);
            const relationshipType = response.body.data;

            relationshipTypeHelper.validateRelationshipType(relationshipType);

            expect(relationshipType.code).toBe(code);
            expect(relationshipType.shortDecodeText).toBe('Business Representative');
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
                expect(err.response.body.status).toBe(404);
                done();
            });
    });

    it('can list current', async(done) => {

        relationshipTypeHelper.listAllCurrent()
            .then((response) => {

                const relationshipTypes = response.body.data;

                expect(relationshipTypes.length > 0).toBeTruthy();
                for (let item of relationshipTypes) {
                    relationshipTypeHelper.validateRelationshipType(item);
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
