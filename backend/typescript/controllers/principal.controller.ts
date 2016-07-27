import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {Headers} from './headers';
import {IPrincipal} from '../models/principal.model';

export class PrincipalController {

    private findMe = async(req: Request, res: Response) => {
        const principal = res.locals[Headers.Principal];
        const schema = {};
        validateReqSchema(req, schema)
            .then((req: Request) => principal ? principal : null)
            .then((model: IPrincipal) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router: Router) => {

        router.get('/v1/me',
            security.isAuthenticated,
            this.findMe);

        return router;

    };

}
