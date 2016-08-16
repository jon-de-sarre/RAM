import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
//import {Headers} from './headers';

export class TransactController {

    private allowed = async(req: Request, res: Response) => {
        const schema = {};
        const auskey = context.getAuthenticatedAUSkey();
        const abn = context.getAuthenticatedABN();
        console.log('auskey =', auskey, ', abn =', abn);
        validateReqSchema(req, schema)
            .then((req: Request) => {
                return {allowed: true};
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