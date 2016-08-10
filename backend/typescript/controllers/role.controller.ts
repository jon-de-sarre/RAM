import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendResource, sendList, sendSearchResult, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {Assert} from '../models/base';
import {IPartyModel, PartyModel, IParty} from '../models/party.model';
import {IRoleModel, RoleStatus} from '../models/role.model';
import {FilterParams} from '../../../commons/RamAPI';

// todo add data security
export class RoleController {

    constructor(private roleModel:IRoleModel, private partyModel:IPartyModel) {
    }

    private findByIdentifier = async(req:Request, res:Response) => {
        const schema = {
            'identifier': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identifier is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.roleModel.findByIdentifier(req.params.identifier))
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private searchByIdentity = async(req:Request, res:Response) => {
        const schema = {
            'identity_id': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identity Id is not valid'
            },
            'filter': {
                in: 'query'
            },
            'page': {
                in: 'query',
                notEmpty: true,
                isNumeric: {
                    errorMessage: 'Page is not valid'
                }
            },
            'pageSize': {
                in: 'query',
                optional: true,
                isNumeric: {
                    errorMessage: 'Page Size is not valid'
                }
            }
        };
        const filterParams = FilterParams.decode(req.query.filter);
        validateReqSchema(req, schema)
            .then((req:Request) => this.roleModel.searchByIdentity(
                req.params.identity_id,
                filterParams.get('roleType'),
                filterParams.get('status'),
                parseInt(req.query.page),
                req.query.pageSize ? parseInt(req.query.pageSize) : null)
            )
            .then((results) => (results.map((model) => model.toHrefValue(true))))
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private createByIdentity = async(req:Request, res:Response) => {
        const schema = {
            'roleType.value.code': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Code is not valid'
            },
            'party.href': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Party is missing'
            }
        };
        validateReqSchema(req, schema)
            .then((req: Request) => {
                const partyHref = req.body.party.href;

                // todo move to util
                const searchString = '/api/v1/party/identity/';
                let idValue:string = null;
                if (partyHref.startsWith(searchString, partyHref)) {
                    idValue = decodeURIComponent(partyHref.substr(searchString.length));
                }

                return idValue !== null ? PartyModel.findByIdentityIdValue(idValue) : null;
            })
            .then((party:IParty) => {
                Assert.assertTrue(party !== null, 'Party not found');
                const agencyUser = security.getAuthenticatedAgencyUser(res);
                return party.addRole(req.body, agencyUser);
            })
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private listStatuses = (req:Request, res:Response) => {
        const schema = {};
        validateReqSchema(req, schema)
            .then((req:Request) => RoleStatus.values() as RoleStatus[])
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/role/:identifier',
            security.isAuthenticated,
            this.findByIdentifier);

        router.get('/v1/roles/identity/:identity_id',
            security.isAuthenticated,
            this.searchByIdentity);

        router.post('/v1/role',
            security.isAuthenticatedAsAgencyUser,
            this.createByIdentity);

        router.get('/v1/roleStatuses',
            this.listStatuses);

        return router;

    };

}
