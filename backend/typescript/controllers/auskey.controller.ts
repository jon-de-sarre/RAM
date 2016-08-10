import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {sendResource, sendError, sendNotFoundError, validateReqSchema, sendSearchResult} from './helpers';
import {IIdentityModel} from '../models/identity.model';
import {AUSkeyType} from '../models/auskey.model';
import {IAUSkeyProvider} from '../providers/auskey.provider';
import {FilterParams} from '../../../commons/RamAPI';
import {Assert} from '../models/base';

export class AuskeyController {

    constructor(private identityModel: IIdentityModel, private auskeyProvider: IAUSkeyProvider) {
    }

    private findAusKey = (req: Request, res: Response) => {
        const schema = {
            'id': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'AUSkey Id is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req: Request) => this.auskeyProvider.findById(req.params.id))
            .then((model) => model ? model.toHrefValue(true) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private searchAusKeys = (req: Request, res: Response) => {
        const schema = {
            'idValue': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identity Id is not valid'
            },
            'filter': {
                in: 'query'
            },
            'page': {
                in: 'query',
                notEmpty: true,
                isNumeric: {
                    errorMessage: 'Page is not valid'
                }
            },
            'pageSize': {
                in: 'query',
                optional: true,
                isNumeric: {
                    errorMessage: 'Page Size is not valid'
                }
            }
        };
        const filterParams = FilterParams.decode(req.query.filter);
        validateReqSchema(req, schema)
            .then(async(req: Request) => {
                const auskeyType = filterParams.get('auskeyType');
                Assert.assertNotNull(auskeyType, 'Filter param auskeyType must be supplied');

                const identity = await this.identityModel.findByIdValue(req.params.idValue);
                return await this.auskeyProvider.searchByABN(
                    identity.rawIdValue,
                    AUSkeyType.valueOf(auskeyType),
                    parseInt(req.query.page),
                    req.query.pageSize ? parseInt(req.query.pageSize) : null
                );
            })
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router: Router) => {

        router.get('/v1/auskey/:id',
            security.isAuthenticatedAsAgencyUser,
            this.findAusKey);

        router.get('/v1/auskeys/identity/:idValue',
            security.isAuthenticatedAsAgencyUser,
            this.searchAusKeys);

        return router;

    };

}