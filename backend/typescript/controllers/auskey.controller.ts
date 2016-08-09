import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendResource, sendList, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {IIdentityModel} from '../models/identity.model';
import {IAUSkeyProvider} from '../providers/auskey.provider';

export class AuskeyController {

    constructor(private identityModel: IIdentityModel, private ausKeyProvider: IAUSkeyProvider) {
    }

    private findAusKey = (req: Request, res: Response) => {
        const schema = {
            'id': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'AUSkey Id is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req: Request) => this.ausKeyProvider.findById(req.params.id))
            .then((model) => model ? model.toHrefValue(true) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private listAusKeys = (req: Request,  res: Response) => {
        const schema = {
            'idValue': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identity Id is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then(async(req: Request) => {
                const identity = await this.identityModel.findByIdValue(req.params.idValue);
                return await this.ausKeyProvider.listDevicesByABN(identity.rawIdValue);
            })
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router: Router) => {

        router.get('/v1/auskey/:id',
            security.isAuthenticatedAsAgencyUser,
            this.findAusKey);

        router.get('/v1/auskeys/identity/:idValue',
            security.isAuthenticatedAsAgencyUser,
            this.listAusKeys);

        return router;

    };

}