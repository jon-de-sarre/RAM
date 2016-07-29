import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {
    sendList, sendSearchResult, sendError, sendNotFoundError, validateReqSchema
} from './helpers';
import {IPartyModel} from '../models/party.model';
import {IRoleModel, RoleStatus} from '../models/role.model';

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
        validateReqSchema(req, schema)
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

        router.get('/v1/roles/identity/:identity_id',
            security.isAuthenticatedAsAgencyUser,
            this.searchByIdentity);

        router.get('/v1/roleStatuses',
            this.listStatuses);

        return router;

    };

}
