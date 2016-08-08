import {RestCalls} from '../support/rest';
import {config} from '../bootstrap';

const rest = new RestCalls(config.host, config.port);

/**
 * Reusable test steps for the RelationshipType REST API.
 *
 * Use these steps for any tests that need to interact with the RelationshipType REST API.
 */
export default class RelationshipTypeHelper {

    public findByCode = (code:string) => {
        return rest.promisify(rest.get(`/v1/relationshipType/${code}`));
    };

    public listAllCurrent = () => {
        return rest.promisify(rest.get('/v1/relationshipTypes'));
    };

    // TODO create

    // TODO update

    public validateRelationshipType = (relationshipType) => {
        expect(relationshipType.code).toBeDefined();
        expect(relationshipType.shortDecodeText).toBeDefined();
        expect(relationshipType.longDecodeText).toBeDefined();
        // TODO assert that there is no ID property
    };
}