import {Router, Request, Response} from 'express';
import {Headers} from './headers';

export class AuthenticatorSimulatorController {

    private authenticate = async(req: Request, res: Response) => {
        const authToken = req.body.credentials;
        if (authToken) {
            const authTokenEncoded = new Buffer(authToken).toString('base64');
            const maxAge = 24 * 60 * 60 * 1000;
            res.status(200);
            res.cookie(Headers.AuthToken, authTokenEncoded, {maxAge: maxAge, path: '/'});
            res.cookie(Headers.AuthTokenDecoded, authToken, {maxAge: maxAge, path: '/'});
            if (req.header(Headers.ABN)) {
                res.cookie(Headers.ABN, req.header(Headers.ABN).valueOf(), {maxAge: maxAge, path: '/'});
            }
            res.send({token: authTokenEncoded});
        } else {
            res.status(401);
            res.set('WWW-Authenticate', '/api/v1/simulators/authenticate');
            res.clearCookie(Headers.AuthToken);
            res.clearCookie(Headers.AuthTokenDecoded);
            res.clearCookie(Headers.ABN);
            res.send({token: null});
        }
    };

    private showLocals = async(req: Request, res: Response) => {
        res.status(200);
        res.send(res.locals);
    };

    public assignRoutes = (router: Router) => {
        router.post('/v1/simulators/authenticator/authenticate', this.authenticate);
        router.get('/v1/simulators/authenticator/locals', this.showLocals);
        return router;
    };

}
