/*
 * API for client to list businesses based on a search by ABN
 * or name. The name search is not static and will find companies
 * with similar but not exact names - by any name they are known by
 * officially.
 */
import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {sendResource, sendError, sendNotFoundError} from './helpers';
import {ABR} from '../providers/abr.provider';
import {IdentityModel} from '../models/identity.model';

export class BusinessController {

    /*
     * Pop off the the ABR and retrieve an entry for the ABN provided.
     * Return it as an array of one entry if found - to match findByName.
     */
    private findByABN = (req: Request, res: Response) => {
        ABR.searchABN(req.params.abn)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    /*
     * Another external request to the ABR - except this time for a list of
     * companies that match the name given. Search is loose with the closest at
     * the top of the list. Can include trading names (deprecated) and other
     * related names. More than just Soundex since ATO matches Australian Tax
     * Office among others.
     */
    private findByName = (req: Request, res: Response) => {
        ABR.searchNames(req.params.name)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    /*
     * Given the information retrieved above, the user may show an interest.
     * At this time we need to record an identity and associated party in RAM
     * if one does not already exist. Even if one does exist for the ABN, it
     * may be under a different name.
     */
    private registerABRRetrievedCompany = (req: Request, res: Response) => {
        IdentityModel.addCompany(req.params.abn, req.params.name)
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router: Router) => {

        router.get('/v1/business/abn/:abn',
            context.begin,
            context.isAuthenticated,
            this.findByABN);

        router.get('/v1/business/name/:name',
            context.begin,
            context.isAuthenticated,
            this.findByName);

        router.get('/v1/business/register/:abn/:name',
            context.begin,
            context.isAuthenticated,
            this.registerABRRetrievedCompany);

        return router;

    };

}