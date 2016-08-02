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
import {IdentityModel} from '../models/identity.model';

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

    private registerABRRetrievedCompany = (req:Request, res:Response) => {
        IdentityModel.addCompany(req.params.abn, req.params.name)
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

        router.get('/v1/business/register/:abn/:name',
            security.isAuthenticated,
            this.registerABRRetrievedCompany);

        return router;

    };

}