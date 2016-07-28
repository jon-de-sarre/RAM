import * as express from 'express';
import * as path from 'path';
import * as loggerMorgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';
import * as mongoose from 'mongoose';
import {conf} from './bootstrap';
import {logStream, logger} from './logger';
// import {continueOnlyIfJWTisValid} from './security'
import expressValidator = require('express-validator');
import {ErrorResponse} from '../../commons/RamAPI2';

import {forgeRockSimulator} from './controllers/forgeRock.simulator.middleware';
import {security} from './controllers/security.middleware';

// DEVELOPMENT RESOURCES
import {AuthenticatorSimulatorController} from './controllers/authenticator.simulator.controller';
import {AgencyUserController} from './controllers/agencyUser.controller';
import {ResetController} from './controllers/reset.server.controller';

// PRODUCTION RESOURCES
import {PrincipalController} from './controllers/principal.controller';
import {BusinessController} from './controllers/business.controller';
import {PartyController} from './controllers/party.controller';
import {ProfileController} from './controllers/profile.controller';
import {IdentityController} from './controllers/identity.controller';
import {RelationshipController} from './controllers/relationship.controller';
import {RelationshipTypeController} from './controllers/relationshipType.controller';
import {RelationshipAttributeNameController} from './controllers/relationshipAttributeName.controller';

import {IdentityModel} from './models/identity.model';
import {PartyModel} from './models/party.model';
import {ProfileModel} from './models/profile.model';
import {RelationshipModel} from './models/relationship.model';
import {RelationshipTypeModel} from './models/relationshipType.model';
import {RelationshipAttributeNameModel} from './models/relationshipAttributeName.model';

// connect to the database ............................................................................................

mongoose.connect(conf.mongoURL, {}, () => {
    logger.info(`Connected to db: ${conf.mongoURL}\n`);
});

// configure express ..................................................................................................

const server = express();

switch (conf.devMode) {
    case false:
        // todo: Log to file: https://github.com/expressjs/morgan
        server.use(loggerMorgan('prod', { stream: logStream }));
        break;
    default:
        server.set('json spaces', 2);
        server.use(loggerMorgan('dev', { stream: logStream }));
        break;
}

server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(expressValidator());
server.use(methodOverride());
server.use(express.static(path.join(__dirname, conf.frontendDir)));
server.use(express.static('swagger'));

// server.use(continueOnlyIfJWTisValid(conf.jwtSecretKey,true));

// setup security .....................................................................................................

if (conf.devMode) {
    server.use(forgeRockSimulator.prepareRequest());
}

server.use(security.prepareRequest());

if (conf.devMode) {
    server.use('/api/', new AuthenticatorSimulatorController().assignRoutes(express.Router()));
}

// setup route handlers (dev) .........................................................................................

server.use('/api/',
    new AgencyUserController()
        .assignRoutes(express.Router()));

server.use('/api/reset',
    new ResetController().assignRoutes(express.Router()));

// setup route handlers (production) ..................................................................................

server.use('/api/',
    new PrincipalController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new RelationshipTypeController(RelationshipTypeModel)
        .assignRoutes(express.Router()));

server.use('/api/',
    new RelationshipAttributeNameController(RelationshipAttributeNameModel)
        .assignRoutes(express.Router()));

server.use('/api/',
    new IdentityController(IdentityModel)
        .assignRoutes(express.Router()));

server.use('/api/',
    new PartyController(PartyModel)
        .assignRoutes(express.Router()));

server.use('/api/',
    new BusinessController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new ProfileController(ProfileModel)
        .assignRoutes(express.Router()));

server.use('/api/',
    new RelationshipController(RelationshipModel, PartyModel)
        .assignRoutes(express.Router()));

// setup error handlers ...............................................................................................

// catch 404 and forward to error handler
server.use((req: express.Request, res: express.Response) => {
    const err = new ErrorResponse('Request Not Found');
    res.send(err);
});

// start server .......................................................................................................

server.listen(conf.httpPort);
logger.info(`RAM Server running in ${conf.devMode?'dev':'prod'} mode on port ${conf.httpPort}`);
