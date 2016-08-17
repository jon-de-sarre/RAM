import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {ITransactRequest, TransactResponse} from '../../../commons/RamAPI';
import {IRoleModel, RoleStatus} from '../models/role.model';
import {IIdentityModel} from '../models/identity.model';
import {Url} from '../models/url';

export class TransactController {

    constructor(private roleModel: IRoleModel,
                private identityModel: IIdentityModel) {
    }

    private allowed = async(req: Request, res: Response) => {

        const schema = {
            'clientABN': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Client ABN is not valid'
            },
            'ssid': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'SSID is not valid'
            },
            'agencyService': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Agency Service is not valid'
            }
        };

        const auskey = context.getAuthenticatedAUSkey();
        const abn = context.getAuthenticatedABN();
        const request = req.body as ITransactRequest;

        console.log('request body =', request);

        console.log('auskey =', auskey, ', abn =', abn);

        validateReqSchema(req, schema)

            .then(async(req: Request) => {

                // ensure auskey and abn authentication supplied
                if (!auskey || !abn) {
                    throw new Error('401');
                }

                // ensure OSP role
                const opsRoles = await this.roleModel.searchByIdentity(Url.abnIdValue(abn), 'OSP', RoleStatus.Active.code, true, 1, 10);
                if (opsRoles.list.length === 0) {
                    throw new Error('401:Organisation is not an Online Service Provider');
                }
                const ospRole = opsRoles.list[0];

                console.log('attributes =', ospRole.attributes);

                // ensure client ABN
                const clientIdentity = await this.identityModel.findByIdValue(Url.abnIdValue(request.clientABN));
                if (!clientIdentity) {
                    throw new Error('400:Client ABN does not match');
                }

                // ensure agency service matches
                let agencyServiceMatched = false;
                const attributes = await ospRole.getAgencyServiceAttributesInDateRange(new Date());
                console.log('filtered agency attributes =', attributes);
                for (let attribute of attributes) {
                    if (attribute.attributeName.code === request.agencyService) {
                        agencyServiceMatched = true;
                    }
                }
                if (!agencyServiceMatched) {
                    throw new Error('401:Agency Service does not match');
                }

                // ensure device AUSkey matches
                let auskeyMatched = false;
                for (let attribute of ospRole.attributes) {
                    if (attribute.attributeName.code === 'DEVICE_AUSKEYS') {
                        for (let value of attribute.value) {
                            if (value === auskey) {
                                auskeyMatched = true;
                                break;
                            }
                        }
                    }
                }
                if (!auskeyMatched) {
                    throw new Error('401:AUSkey does not match');
                }

                // ensure there is a valid OSP relationship between the two parties
                // ensure the relationship has enabled the requested agency service
                // ensure the relationship has the requested SSID

                const allowed = true; // todo compute allowed flag
                return new TransactResponse(request, allowed);

            })

            //.then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));

    };

    public assignRoutes = (router: Router) => {

        router.post('/v1/transact/allowed',
            context.begin,
            this.allowed);

        return router;

    }

}