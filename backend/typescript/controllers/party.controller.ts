import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendResource, sendList, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {Headers} from './headers';
import {IPartyModel, PartyType} from '../models/party.model';

export class PartyController {

    constructor(private partyModel:IPartyModel) {
    }

    private findMe = async (req:Request, res:Response) => {
        const identity = res.locals[Headers.Identity];
        const schema = {};
        validateReqSchema(req, schema)
            .then((req:Request) => identity ? this.partyModel.findByIdentityIdValue(identity.idValue) : null)
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private findByIdentityIdValue = (req:Request, res:Response) => {
        const schema = {
            'idValue': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Id Value is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.partyModel.findByIdentityIdValue(req.params.idValue))
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private findTypeByName = (req:Request, res:Response) => {
        const schema = {
            'name': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Name is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => PartyType.valueOf(req.params.code))
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private listTypes = (req:Request, res:Response) => {
        const schema = {
        };
        validateReqSchema(req, schema)
            .then((req:Request) => PartyType.values())
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/party/identity/me',
            security.isAuthenticated,
            this.findMe);

        router.get('/v1/party/identity/:idValue',
            security.isAuthenticated,
            this.findByIdentityIdValue);

        router.get('/v1/partyType/:code',
            this.findTypeByName);

        router.get('/v1/partyTypes',
            this.listTypes);

        return router;

    };

}