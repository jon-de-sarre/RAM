import * as jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import {ErrorResponse} from '../../commons/RamAPI2';
import * as sApi from './ram/ServerAPI';

export const signToken = (secret: string, jwtExpiryInMinutes: number) => {
    return (secToken: sApi.SecurityToken) => jwt.sign(secToken, secret, {
        expiresInMinutes: jwtExpiryInMinutes
    });
};

export const continueOnlyIfJWTisValid =
(jwtSecretKey: string, createIfNotExist: boolean = false) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let tokenHeaderExists = req.headers['authorization'] && req.headers['authorization'].split(' ')[0] === 'Bearer';
        let token = tokenHeaderExists && jwt.verify(req.headers['authorization'].split(' ')[1], jwtSecretKey);
        if (token) {
            req.user = token;
            next();
        } else {
            if (createIfNotExist) {
                req.user = signToken(jwtSecretKey, 5)({ partyId: '123', navPathIds: [] });
                next();
            } else {
                res.status(401).send(new ErrorResponse('Invalid security token.'));
            }
        }
    };
};