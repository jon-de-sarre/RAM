import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {ITransactRequest, TransactResponse} from '../../../commons/RamAPI';
//import {Headers} from './headers';

export class TransactController {

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
            .then((req: Request) => {
                const allowed = true; // todo compute allowed flag
                return new TransactResponse(request, allowed);
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