import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {Headers} from './headers';
import {IPrincipal} from '../../../commons/RamAPI2';

export class PrincipalController {

    constructor() {
    }

    private findMe = async (req:Request, res:Response) => {
        const identity = res.locals[Headers.Identity];
        const schema = {};
        validateReqSchema(req, schema)
            .then((req:Request) => identity ? identity : null)
            .then((model) => model ? {
                id: model.idValue,
                displayName: model.profile.name._displayName,
                isAgencyUser: false} as IPrincipal : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/me',
            security.isAuthenticated,
            this.findMe);

        return router;

    };

}
