import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {sendResource, sendError, sendNotFoundError, validateReqSchema, sendSearchResult} from './helpers';
import {IAUSkeyProvider} from '../providers/auskey.provider';
import {AUSkeyType} from '../models/auskey.model';
import {IPartyModel} from '../models/party.model';
import {IIdentityModel} from '../models/identity.model';
import {FilterParams} from '../../../commons/RamAPI';
import {Assert} from '../models/base';
import {Translator} from '../ram/translator';

export class AuskeyController {

    constructor(private auskeyProvider: IAUSkeyProvider, private partyModel: IPartyModel, private identityModel: IIdentityModel) {
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
                errorMessage: Translator.get('error.identityIdInvalid')
            },
            'filter': {
                in: 'query'
            },
            'page': {
                in: 'query',
                notEmpty: true,
                isNumeric: {
                    errorMessage: Translator.get('error.pageInvalid')
                }
            },
            'pageSize': {
                in: 'query',
                optional: true,
                isNumeric: {
                    errorMessage: Translator.get('error.pageSizeInvalid')
                }
            }
        };
        const filterParams = FilterParams.decode(req.query.filter);
        validateReqSchema(req, schema)
            .then(async (req: Request) => {
                const idValue = req.params.idValue;
                const myPrincipal = context.getAuthenticatedPrincipal();
                if (!myPrincipal.agencyUserInd) {
                    const myIdentity = context.getAuthenticatedIdentity();
                    const hasAccess = await this.partyModel.hasAccess(idValue, myPrincipal, myIdentity);
                    if (!hasAccess) {
                        console.log('Identity access denied or does not exist', idValue);
                        throw new Error('403');
                    }
                }
                return req;
            })
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
            context.begin,
            context.isAuthenticatedAsAgencyUser,
            this.findAusKey);

        router.get('/v1/auskeys/identity/:idValue',
            context.begin,
            context.isAuthenticated,
            this.searchAusKeys);

        return router;

    };

}