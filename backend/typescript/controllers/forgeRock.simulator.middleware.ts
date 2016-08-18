import {logger} from '../logger';
import * as colors from 'colors';
import {Request, Response} from 'express';
import {Headers} from './headers';
import {SecurityHelper} from './security.middleware';
import {AgencyUsersSeeder} from '../seeding/seed-agency-users';
import {IIdentity, IdentityModel} from '../models/identity.model';
import {IAgencyUser} from '../models/agencyUser.model';

class ForgeRockSimulator {

    public prepareRequest(): (req: Request, res: Response, next: () => void) => void {
        const self = this;
        return (req: Request, res: Response, next: () => void) => {
            const idFromAuthenticationSimulator = req.body.credentials;
            const idFromCookie = SecurityHelper.getValueFromCookies(req, Headers.AuthToken);
            //console.log('idFromAuthenticationSimulator=', idFromAuthenticationSimulator);
            //console.log('idFromCookie=', idFromCookie);
            const id = idFromAuthenticationSimulator ? idFromAuthenticationSimulator : idFromCookie;
            if (id) {
                const agencyUser = AgencyUsersSeeder.findById(id);
                if (agencyUser) {
                    Promise.resolve(agencyUser)
                        .then(self.resolveForAgencyUser(req, res, next))
                        .catch(self.reject(res, next));
                } else {
                    IdentityModel.findByIdValue(id)
                        .then(self.resolveForIdentity(req, res, next))
                        .catch(self.reject(res, next));
                }
            } else {
                next();
            }
        };
    }

    private resolveForAgencyUser(req: Request, res: Response, next: () => void) {
        return (agencyUser?: IAgencyUser) => {
            if (agencyUser) {
                logger.info(colors.red(`Setting ${Headers.AgencyUserLoginId}: ${agencyUser.id}`));
                let programRolesString = '';
                for (let i = 0; i < agencyUser.programRoles.length; i = i + 1) {
                    let programRole = agencyUser.programRoles[i];
                    programRolesString += (i > 0 ? ',' : '') + programRole.program + ':' + programRole.role;
                }
                res.locals[Headers.AgencyUserLoginId] = agencyUser.id;
                res.locals[Headers.GivenName] = agencyUser.givenName;
                res.locals[Headers.FamilyName] = agencyUser.familyName;
                res.locals[Headers.AgencyUserAgency] = agencyUser.agency;
                res.locals[Headers.AgencyUserProgramRoles] = programRolesString;
            }
            next();
        };
    }

    private resolveForIdentity(req: Request, res: Response, next: () => void) {
        const abnFromHeaders = req.headers[Headers.ABN];
        const abnFromCookie = req.cookies[Headers.ABN];
        if (abnFromHeaders) {
            res.locals[Headers.ABN] = abnFromHeaders;
        } else if (abnFromCookie) {
            res.locals[Headers.ABN] = abnFromCookie;
            req.headers[Headers.ABN] = abnFromCookie;
        }
        return (identity?: IIdentity) => {
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

    private reject(res: Response, next: () => void) {
        return (): void => {
            logger.info('Unable to look up identity or agency user!');
            res.status(401);
            res.send({});
        };
    }

}

export const forgeRockSimulator = new ForgeRockSimulator();
