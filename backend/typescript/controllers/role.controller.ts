import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {
    sendResource, sendList, sendSearchResult, sendError, sendNotFoundError, validateReqSchema, REGULAR_CHARS
} from './helpers';
import {IPartyModel} from '../models/party.model';
import {IRoleModel} from '../models/role.model';
import {FilterParams} from '../../../commons/RamAPI2';
import {PartyModel} from '../models/party.model';
import {Headers} from './headers';

// todo add data security
export class RoleController {

    constructor(private roleModel:IRoleModel, private partyModel:IPartyModel) {
    }

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
            .then(async (req:Request) => {
                const me = res.locals[Headers.Identity];
                const hasAccess = await this.partyModel.hasAccess(me.party, req.params.identity_id);
                if (!hasAccess) {
                    throw new Error('You do not have access to this party.');
                }
                return req;
            })
            .then((req:Request) => this.roleModel.searchByIdentity(
                req.params.identity_id,
                parseInt(req.query.page),
                req.query.pageSize ? parseInt(req.query.pageSize) : null)
            )
            .then((results) => (results.map((model) => model.toHrefValue(true))))
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };


    public assignRoutes = (router:Router) => {

        router.get('/v1/roles/identity/:identity_id',
            security.isAuthenticated,
            this.searchByIdentity);

        return router;

    };
}
