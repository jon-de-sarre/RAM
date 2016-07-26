import {logger} from '../logger';
import * as colors from 'colors';
import {Request, Response} from 'express';
import {Headers} from './headers';
import {ErrorResponse} from '../../../commons/RamAPI';
import {CreateIdentityDTO} from '../../../commons/RamAPI';
import {IPrincipal, IAgencyUser, IAgencyUserProgramRole} from '../../../commons/RamAPI2';
import {IIdentity, IdentityModel} from '../models/identity.model';
import {DOB_SHARED_SECRET_TYPE_CODE} from '../models/sharedSecretType.model';

// todo determine if we need to base64 decode header values to be spec compliant?

class Security {

    public prepareRequest(): (req: Request, res: Response, next: () => void) => void {
        return (req: Request, res: Response, next: () => void) => {
            //this.logHeaders(req);
            const agencyUserLoginIdValue = this.getValueFromHeaderLocalsOrCookie(req, res, Headers.AgencyUserLoginId);
            const identityIdValue = this.getValueFromHeaderLocalsOrCookie(req, res, Headers.IdentityIdValue);
            if (agencyUserLoginIdValue) {
                // agency login supplied, carry on
                Promise.resolve(agencyUserLoginIdValue)
                    .then(this.prepareAgencyUserResponseLocals(req, res, next))
                    .then(this.prepareCommonResponseLocals(req, res, next))
                    .catch(this.reject(res, next));
            } else if (identityIdValue) {
                // identity id supplied, try to lookup and if not found create a new identity before carrying on
                IdentityModel.findByIdValue(identityIdValue)
                    .then(this.createIdentityIfNotFound(req, res))
                    .then(this.prepareIdentityResponseLocals(req, res, next))
                    .then(this.prepareCommonResponseLocals(req, res, next))
                    .catch(this.reject(res, next));
            } else {
                // no id supplied, carry on
                Promise.resolve(null)
                    .then(this.prepareIdentityResponseLocals(req, res, next))
                    .then(this.prepareCommonResponseLocals(req, res, next))
                    .catch(this.reject(res, next));
            }
        };
    }

    private getValueFromHeaderLocalsOrCookie(req: Request, res: Response, key: string): string {

        // look for id in headers
        if (req.get(key)) {
            // logger.info('found header', req.get(key));
            return req.get(key);
        }

        // look for id in locals
        if (res.locals[key]) {
            // logger.info('found local', res.locals[key]);
            return res.locals[key];
        }

        // look for id in cookies
        return SecurityHelper.getValueFromCookies(req, key);

    }

    /* tslint:disable:max-func-body-length */
    private createIdentityIfNotFound(req: Request, res: Response) {
        return (identity?: IIdentity) => {
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

    private prepareAgencyUserResponseLocals(req: Request, res: Response, next: () => void) {
        return (idValue: string) => {
            logger.info('Agency User context:', (idValue ? colors.magenta(idValue) : colors.red('[not found]')));
            if (idValue) {
                const agencyUserGivenName = this.getValueFromHeaderLocalsOrCookie(req, res, Headers.GivenName);
                const agencyUserFamilyName = this.getValueFromHeaderLocalsOrCookie(req, res, Headers.FamilyName);
                const agencyUserDisplayName = agencyUserGivenName ?
                    agencyUserGivenName + (agencyUserFamilyName ? ' ' + agencyUserFamilyName : '') :
                    (agencyUserFamilyName ? agencyUserFamilyName : '');
                const programRoles: IAgencyUserProgramRole[] = [];
                const programRolesRaw = this.getValueFromHeaderLocalsOrCookie(req, res, Headers.AgencyUserProgramRoles);
                if (programRolesRaw) {
                    const programRowStrings = programRolesRaw.split(',');
                    for (let programRoleString of programRowStrings) {
                        programRoles.push({
                            program: programRoleString.split(':')[0],
                            role: programRoleString.split(':')[1]
                        } as IAgencyUserProgramRole);
                    }
                }
                res.locals[Headers.Principal] = {
                    id: idValue,
                    displayName: agencyUserDisplayName,
                    agencyUserInd: true
                } as IPrincipal;
                res.locals[Headers.PrincipalIdValue] = idValue;
                res.locals[Headers.AgencyUser] = {
                    id: idValue,
                    givenName: agencyUserGivenName,
                    familyName: agencyUserFamilyName,
                    displayName: agencyUserDisplayName,
                    programRoles: programRoles
                } as IAgencyUser;
            }
        };
    }

    private prepareIdentityResponseLocals(req: Request, res: Response, next: () => void) {
        return (identity?: IIdentity) => {
            logger.info('Identity context:', (identity ? colors.magenta(identity.idValue) : colors.red('[not found]')));
            if (identity) {
                res.locals[Headers.Principal] = {
                    id: identity.idValue,
                    displayName: identity.profile.name._displayName,
                    agencyUserInd: false
                } as IPrincipal;
                res.locals[Headers.PrincipalIdValue] = identity.idValue;
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
        };
    }

    private prepareCommonResponseLocals(req: Request, res: Response, next: () => void) {
        return () => {
            for (let key of Object.keys(req.headers)) {
                // headers should be lowercase, but lets make sure
                const keyLower = key.toLowerCase();
                // if it's an application header, copy it to locals
                if (keyLower.startsWith(Headers.Prefix)) {
                    const value = req.get(key);
                    res.locals[keyLower] = value;
                }
            }
            next();
        };
    }

    private reject(res: Response, next: () => void) {
        return (err: Error): void => {
            logger.error(('Unable to look up identity: ' + err).red);
            res.status(401);
            res.send(new ErrorResponse('Unable to look up identity.'));
        };
    }

    public getAuthenticatedIdentityIdValue(res: Response): string {
        return res.locals[Headers.IdentityIdValue];
    }

    public getAuthenticatedIdentity(res: Response): IIdentity {
        return res.locals[Headers.Identity];
    }

    public getAuthenticatedPrincipalIdValue(res: Response): string {
        return res.locals[Headers.PrincipalIdValue];
    }

    public getAuthenticatedPrincipal(res: Response): IPrincipal {
        return res.locals[Headers.Principal];
    }

    public isAuthenticated(req: Request, res: Response, next: () => void) {
        const id = res.locals[Headers.PrincipalIdValue];
        if (id) {
            next();
        } else {
            logger.error('Unable to invoke route requiring authentication'.red);
            res.status(401);
            res.send(new ErrorResponse('Not authenticated.'));
        }
    }

    // private logHeaders(req:Request) {
    //     for (let header of Object.keys(req.headers)) {
    //         if(Headers.isXRAMHeader(header)) {
    //             logger.debug(header, '=', req.headers[header]);
    //         }
    //     }
    // }

}

export class SecurityHelper {

    public static getValueFromCookies(req: Request, keyToMatch: string): string {
        const keyToMatchLower = keyToMatch.toLowerCase();
        for (let key of Object.keys(req.cookies)) {
            const keyLower = key.toLowerCase();
            if (keyLower === keyToMatchLower) {
                const encodedValue = req.cookies[key];
                if (encodedValue) {
                    return new Buffer(encodedValue, 'base64').toString('ascii');
                }
            }
        }
        return null;
    }

}

export const security = new Security();
