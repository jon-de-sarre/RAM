import {Router, Request, Response} from 'express';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {HealthCheck} from '../models/healthCheck.model';

export class SystemController {

    private healthCheckShallow = async(req: Request, res: Response) => {
        const schema = {};
        validateReqSchema(req, schema)
            .then((req: Request) => {
                return new HealthCheck(200, 'OK');
            })
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private healthCheckDeep = async(req: Request, res: Response) => {
        const schema = {};
        validateReqSchema(req, schema)
            .then((req: Request) => {
                return new HealthCheck(200, 'OK');
            })
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router: Router) => {

        router.get('/healthcheck/shallow',
            this.healthCheckShallow);

        router.get('/healthcheck/deep',
            this.healthCheckDeep);

        return router;

    };

}