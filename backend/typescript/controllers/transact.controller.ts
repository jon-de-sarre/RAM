import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {ITransactRequest, TransactResponse} from '../../../commons/RamAPI';
import {IRoleModel, RoleStatus} from '../models/role.model';
import {Url} from '../models/url';

export class TransactController {

    constructor(private roleModel: IRoleModel) {
    }

    private allowed = async(req: Request, res: Response) => {

        const schema = {
            'clientABN': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Client ABN is not valid'
            },
            'ssid': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'SSID is not valid'
            },
            'agencyService': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Agency Service is not valid'
            }
        };

        const auskey = context.getAuthenticatedAUSkey();
        const abn = context.getAuthenticatedABN();
        const request = req.body as ITransactRequest;

        console.log('request body =', request);

        console.log('auskey =', auskey, ', abn =', abn);

        validateReqSchema(req, schema)
            .then(async(req: Request) => {
                if (!auskey || !abn) {
                    throw new Error('401');
                } else {
                    // look up the OSP via the ABN
                    // ensure a valid OSP role exists with the requested agency service
                    let roles = await this.roleModel.searchByIdentity(Url.abnIdValue(abn), 'OSP', RoleStatus.Active.code, true, 1, 10);
                    console.log('roles=', roles);
                    // ensure there is a selected device AUSkey for the role
                    // lookup the client business via the ABN
                    // ensure there is a valid OSP relationship between the two parties
                    // ensure the relationship has enabled the requested agency service
                    // ensure the relationship has the requested SSID
                    const allowed = true; // todo compute allowed flag
                    return new TransactResponse(request, allowed);
                }
            })
            //.then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));

    };

    public assignRoutes = (router: Router) => {

        router.post('/v1/transact/allowed',
            context.begin,
            context.isAuthenticated,
            this.allowed);

        return router;

    }

}