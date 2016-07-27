import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendList, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {Headers} from './headers';
import {conf} from '../bootstrap';
import {IAgencyUser} from '../models/agencyUser.model';
import {AgencyUsersSeeder} from '../seeding/seed-agency-users';

export class AgencyUserController {

    private search = async(req: Request, res: Response) => {
        const principal = res.locals[Headers.Principal];
        const schema = {};
        validateReqSchema(req, schema)
            .then((req:Request) => AgencyUsersSeeder.all())
            .then((results) => (results.map((model) => model.toDTO())))
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router: Router) => {

        if (conf.devMode) {
            router.get('/v1/agencyUsers', this.search);
        }

        return router;

    };

}
