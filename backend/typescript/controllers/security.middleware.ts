import {logger} from '../logger';
import * as colors from 'colors';
import {Request, Response} from 'express';
import {Headers} from './headers';
import {ErrorResponse} from '../../../commons/RamAPI';
import {CreateIdentityDTO} from '../../../commons/RamAPI';
import {IIdentity, IdentityModel} from '../models/identity.model';
import {DOB_SHARED_SECRET_TYPE_CODE} from '../models/sharedSecretType.model';

// todo determine if we need to base64 decode header values to be spec compliant?

class Security {

    public prepareRequest():(req:Request, res:Response, next:() => void) => void {
        return (req:Request, res:Response, next:() => void) => {
            //this.logHeaders(req);

            const idValue = this.getIdValue(req, res);
            if (idValue) {
                // id supplied, try to lookup and if not found create a new identity before carrying on
                IdentityModel.findByIdValue(idValue)
                    .then(this.createIdentityIfNotFound(req, res))
                    .then(this.prepareResponseLocals(req, res, next), this.reject(res, next));
            } else {
                // id not supplied, carry on
                Promise.resolve(null)
                    .then(this.prepareResponseLocals(req, res, next), this.reject(res, next));
            }
        };
    }

    private logHeaders(req:Request) {
        for(let header in req.headers) {
            if(Headers.isXRAMHeader(header)) {
                logger.debug(header, '=', req.headers[header]);
            }
        }
    }

    /**
     * Attempts to provide an Identity Value by looking in the following:
     *  header,
     *  locals,
     *  cookie
     */
    private getIdValue(req:Request, res:Response):string {

        // look for id in headers
        if(req.get(Headers.IdentityIdValue)) {
            // logger.info('found header', req.get(Headers.IdentityIdValue));
            return req.get(Headers.IdentityIdValue);
        }

        // look for id in locals
        if(res.locals[Headers.IdentityIdValue]) {
            // logger.info('found local', res.locals[Headers.IdentityIdValue]);
            return res.locals[Headers.IdentityIdValue];
        }

        // look for id in cookies
        return SecurityHelper.getIdentityIdValueFromCookies(req);

    }

    /* tslint:disable:max-func-body-length */
    private createIdentityIfNotFound(req:Request, res:Response) {
        return (identity?:IIdentity) => {
            const rawIdValue = req.get(Headers.IdentityRawIdValue);
            if (identity) {
                logger.info('Identity context: Using existing identity ...');
                return Promise.resolve(identity);
            } else if (!rawIdValue) {
                logger.info('Identity context: Unable to create identity as raw id value was not supplied ...'.red);
                return Promise.resolve(null);
            } else {
                const dto = new CreateIdentityDTO(
                    rawIdValue,
                    req.get(Headers.PartyType),
                    req.get(Headers.GivenName),
                    req.get(Headers.FamilyName),
                    req.get(Headers.UnstructuredName),
                    DOB_SHARED_SECRET_TYPE_CODE,
                    req.get(Headers.DOB),
                    req.get(Headers.IdentityType),
                    req.get(Headers.AgencyScheme),
                    req.get(Headers.AgencyToken),
                    req.get(Headers.LinkIdScheme),
                    req.get(Headers.LinkIdConsumer),
                    req.get(Headers.PublicIdentifierScheme),
                    req.get(Headers.ProfileProvider)
                );
                logger.info('Identity context: Creating new identity ... ');
                console.log(dto);
                return IdentityModel.createFromDTO(dto);
            }
        };
    }

    private prepareResponseLocals(req:Request, res:Response, next:() => void) {
        return (identity?:IIdentity) => {
            logger.info('Identity context:', (identity ? colors.magenta(identity.idValue) : colors.red('[not found]')));
            if (identity) {
                for (let key of Object.keys(req.headers)) {

                    // headers should be lowercase, but lets make sure
                    const keyLower = key.toLowerCase();

                    // if it's an application header, copy it to locals
                    if (keyLower.startsWith(Headers.Prefix)) {
                        const value = req.get(key);
                        res.locals[keyLower] = value;
                    }

                }
                res.locals[Headers.Identity] = identity;
                res.locals[Headers.IdentityIdValue] = identity.idValue;
                res.locals[Headers.IdentityRawIdValue] = identity.rawIdValue;
                res.locals[Headers.GivenName] = identity.profile.name.givenName;
                res.locals[Headers.FamilyName] = identity.profile.name.familyName;
                res.locals[Headers.UnstructuredName] = identity.profile.name.unstructuredName;
                for (let sharedSecret of identity.profile.sharedSecrets) {
                    res.locals[`${Headers.Prefix}-${sharedSecret.sharedSecretType.code}`.toLowerCase()] = sharedSecret.value;
                }
            }
            next();
        };
    }

    private reject(res:Response, next:() => void) {
        return (err:Error):void => {
            logger.error(('Unable to look up identity: ' + err).red);
            res.status(401);
            res.send(new ErrorResponse('Unable to look up identity.'));
        };
    }

    public getAuthenticatedIdentityIdValue(res:Response):string {
        return res.locals[Headers.IdentityIdValue];
    }

    public getAuthenticatedIdentity(res:Response):IIdentity {
        return res.locals[Headers.Identity];
    }

    public isAuthenticated(req:Request, res:Response, next:() => void) {
        const idValue = res.locals[Headers.IdentityIdValue];
        if (idValue) {
            next();
        } else {
            logger.error('Unable to invoke route requiring authentication'.red);
            res.status(401);
            res.send(new ErrorResponse('Not authenticated.'));
        }
    }
}

export class SecurityHelper {

    public static getIdentityIdValueFromCookies(req:Request):string {

        // find cookie regardless of case
        for (let key of Object.keys(req.cookies)) {

            const keyLower = key.toLowerCase();

            if (keyLower === Headers.AuthToken) {

                // get encoded auth token
                const authTokenEncodedFromCookie = req.cookies[key];

                if(authTokenEncodedFromCookie) {
                    // decode auth token
                    const authToken = new Buffer(authTokenEncodedFromCookie, 'base64').toString('ascii');
                    // get idValue from auth token
                    return this.getIdentityIdValueFromAuthToken(authToken);
                }

            }

        }

        return null;

    }

    private static getIdentityIdValueFromAuthToken(authToken:string):string {
        return authToken;
    }

}

export const security = new Security();
