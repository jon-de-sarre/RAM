import {logger} from '../logger';
import * as colors from 'colors';
import {Request, Response} from 'express';
import {Headers} from './headers';
import {SecurityHelper} from './security.middleware';
import {IIdentity, IdentityModel} from '../models/identity.model';

class ForgeRockSimulator {

    public prepareRequest():(req:Request, res:Response, next:() => void) => void {
        const self = this;
        return (req:Request, res:Response, next:() => void) => {
            const credentialsFromAuthenticationSimulator = req.body.credentials;
            const idValueFromCookie = SecurityHelper.getValueFromCookies(req, Headers.AuthToken);
            if (credentialsFromAuthenticationSimulator) {
                // log in from development only login form
                IdentityModel.findByIdValue(credentialsFromAuthenticationSimulator)
                    .then(self.resolve(req, res, next), self.reject(res, next));
            } else if (idValueFromCookie) {
                // log in from cookie
                IdentityModel.findByIdValue(idValueFromCookie)
                    .then(self.resolve(req, res, next), self.reject(res, next));
            } else {
                next();
            }
        };
    }

    private resolve(req:Request, res:Response, next:() => void) {
        return (identity?:IIdentity) => {
            if (identity) {
                logger.info(colors.red(`Setting ${Headers.IdentityIdValue}: ${identity.idValue}`));
                res.locals[Headers.IdentityIdValue] = identity.idValue;
                req.headers[Headers.IdentityIdValue] = identity.idValue;
                res.locals[Headers.IdentityRawIdValue] = identity.rawIdValue;
                req.headers[Headers.IdentityRawIdValue] = identity.rawIdValue;
            } else {
                const idValue = req.get(Headers.IdentityIdValue);
                const rawIdValue = req.get(Headers.IdentityRawIdValue);
                if (idValue && rawIdValue) {
                    logger.info(colors.red(`Setting ${Headers.IdentityIdValue}: ${idValue}`));
                    res.locals[Headers.IdentityIdValue] = idValue;
                    req.headers[Headers.IdentityIdValue] = idValue;
                    res.locals[Headers.IdentityRawIdValue] = rawIdValue;
                    req.headers[Headers.IdentityRawIdValue] = rawIdValue;
                }
            }
            next();
        };
    }

    private reject(res:Response, next:() => void) {
        return ():void => {
            logger.info('Unable to look up identity!');
            res.status(401);
            res.send({});
        };
    }

}

export const forgeRockSimulator = new ForgeRockSimulator();
