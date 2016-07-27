import {Router, Request, Response} from 'express';
import {sendList, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {conf} from '../bootstrap';
import {AgencyUsersSeeder} from '../seeding/seed-agency-users';

export class AgencyUserController {

    private search = async(req: Request, res: Response) => {
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
