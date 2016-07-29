import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {
    sendResource, sendList, sendError, sendNotFoundError, validateReqSchema
} from './helpers';
import {IPartyModel} from '../models/party.model';
import {IRoleTypeModel} from '../models/roleType.model';

// todo add data security
export class RoleTypeController {

    constructor(private roleTypeModel:IRoleTypeModel, private partyModel:IPartyModel) {
    }

    private listIgnoringDateRange = async (req:Request, res:Response) => {
        const schema = {};
        validateReqSchema(req, schema)
            .then((req:Request) => this.roleTypeModel.listIgnoringDateRange())
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private findByCodeIgnoringDateRange = async (req:Request, res:Response) => {
        const schema = {
            'code': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.roleTypeModel.findByCodeIgnoringDateRange(req.params.code))
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/roleTypes',
            security.isAuthenticated,
            this.listIgnoringDateRange);

        router.get('/v1/roleType/:code',
            security.isAuthenticated,
            this.findByCodeIgnoringDateRange);

        return router;

    };

}
