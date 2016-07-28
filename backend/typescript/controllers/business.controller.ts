/*
 * API for client to list businesses based on a search by ABN
 * or name. The name search is not static and will find companies
 * with similar but not exact names - by any name they are known by
 * officially.
 */
import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendResource, sendError, sendNotFoundError} from './helpers';
import { ABR } from '../providers/abr.provider';

export class BusinessController {

    private findByABN = (req:Request, res:Response) => {
        ABR.searchABN(req.params.abn)
        .then(sendResource(res))
        .then(sendNotFoundError(res))
        .catch(sendError(res));
    };

    private findByName = (req:Request, res:Response) => {
        ABR.searchNames(req.params.name)
        .then(sendResource(res))
        .then(sendNotFoundError(res))
        .catch(sendError(res));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/business/abn/:abn',
            security.isAuthenticated,
            this.findByABN);

        router.get('/v1/business/name/:name',
            security.isAuthenticated,
            this.findByName);

        return router;

    };

}