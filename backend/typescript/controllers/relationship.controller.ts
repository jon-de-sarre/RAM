import {Router, Request, Response} from 'express';
import {security} from './security.middleware';
import {
    sendResource, sendList, sendSearchResult, sendError, sendNotFoundError, validateReqSchema, REGULAR_CHARS
} from './helpers';
import {IPartyModel} from '../models/party.model';
import {IRelationshipModel, RelationshipStatus} from '../models/relationship.model';
import {RelationshipAddDTO, CreateIdentityDTO, AttributeDTO} from '../../../commons/RamAPI';
import {FilterParams} from '../../../commons/RamAPI2';
import {PartyModel} from '../models/party.model';
import {ProfileProvider} from '../models/profile.model';
import {IdentityType} from '../models/identity.model';
import {Headers} from './headers';

// todo add data security
export class RelationshipController {

    constructor(private relationshipModel:IRelationshipModel, private partyModel:IPartyModel) {
    }

    private findByIdentifier = async(req:Request, res:Response) => {
        const schema = {
            'identifier': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identifier is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByIdentifier(req.params.identifier))
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private findByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        const invitationCode = req.params.invitationCode;
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(invitationCode))
            .then((model) => model ? model.toDTO(invitationCode) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private claimByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        const invitationCode = req.params.invitationCode;
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(invitationCode))
            .then((model) => model ? model.claimPendingInvitation(security.getAuthenticatedIdentity(res)) : null)
            .then((model) => model ? model.toDTO(invitationCode) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private acceptByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(req.params.invitationCode))
            .then((model) => {
                console.log('model ', model);
                return model;
            })
            .then((model) => model ? model.acceptPendingInvitation(security.getAuthenticatedIdentity(res)) : null)
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private rejectByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(req.params.invitationCode))
            .then((model) => model ? model.rejectPendingInvitation(security.getAuthenticatedIdentity(res)) : null)
            .then((model) => model ? Promise.resolve({}) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private notifyDelegateByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            },
            'email': {
                in: 'body',
                notEmpty: true,
                isEmail: {
                    errorMessage: 'Email is not valid'
                },
                errorMessage: 'Email is not supplied'
            }
        };

        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findPendingByInvitationCodeInDateRange(req.params.invitationCode, new Date()))
            .then((model) => model ? model.notifyDelegate(req.body.email, security.getAuthenticatedIdentity(res)) : null)
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    /* tslint:disable:max-func-body-length */
    // todo this search might no longer be useful from SS2
    private searchBySubjectOrDelegate = async(req:Request, res:Response) => {
        const schema = {
            'subject_or_delegate': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Subject Or Delegate is not valid',
                matches: {
                    options: ['^(subject|delegate)$'],
                    errorMessage: 'Subject Or Delegate is not valid'
                }
            },
            'identity_id': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identity Id is not valid'
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
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.search(
                req.params.subject_or_delegate === 'subject' ? req.params.identity_id : null,
                req.params.subject_or_delegate === 'delegate' ? req.params.identity_id : null,
                parseInt(req.query.page),
                req.query.pageSize ? parseInt(req.query.pageSize) : null)
            )
            .then((results) => (results.map((model) => model.toHrefValue(true))))
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    /* tslint:disable:max-func-body-length */
    private searchByIdentity = async(req:Request, res:Response) => {
        const schema = {
            'identity_id': {
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
            .then(async (req:Request) => {
                const me = res.locals[Headers.Identity];
                const hasAccess = await this.partyModel.hasAccess(me.party, req.params.identity_id);
                if (!hasAccess) {
                    throw new Error('You do not have access to this party.');
                }
                return req;
            })
            .then((req:Request) => this.relationshipModel.searchByIdentity(
                req.params.identity_id,
                filterParams.get('partyType'),
                filterParams.get('relationshipType'),
                filterParams.get('profileProvider'),
                filterParams.get('status'),
                filterParams.get('text'),
                filterParams.get('sort'),
                parseInt(req.query.page),
                req.query.pageSize ? parseInt(req.query.pageSize) : null)
            )
            .then((results) => (results.map((model) => model.toHrefValue(true))))
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };
    //
    // private searchDistinctSubjectsBySubjectOrDelegateIdentity = async (req:Request, res:Response) => {
    //     // todo need to optional filters (term, party type, relationship type, status)
    //     // todo need to add sorting
    //     const schema = {
    //         'identity_id': {
    //             in: 'params',
    //             notEmpty: true,
    //             errorMessage: 'Identity Id is not valid'
    //         },
    //         'page': {
    //             in: 'query',
    //             notEmpty: true,
    //             isNumeric: {
    //                 errorMessage: 'Page is not valid'
    //             }
    //         },
    //         'pageSize': {
    //             in: 'query',
    //             optional: true,
    //             isNumeric: {
    //                 errorMessage: 'Page Size is not valid'
    //             }
    //         }
    //     };
    //     validateReqSchema(req, schema)
    //         .then((req:Request) => this.relationshipModel.searchDistinctSubjectsBySubjectOrDelegateIdentity(
    //             req.params.identity_id,
    //             req.query.page,
    //             req.query.pageSize)
    //         )
    //         .then((results) => (results.map((model) => model.toHrefValue(true))))
    //         .then(sendSearchResult(res), sendError(res))
    //         .then(sendNotFoundError(res));
    // };

    private create = async(req:Request, res:Response) => {
        // TODO support other party types - currently only INDIVIDUAL is supported here
        // TODO how much of this validation should be in the data layer?
        // TODO decide how to handle dates - should they include time? or should server just use 12am AEST
        const schemaB2I = {
            'relationshipType': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Relationship type is not valid'
            },
            'subjectIdValue': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Subject is not valid'
            },
            'startTimestamp': {
                in: 'body',
                notEmpty: true,
                isDate: {
                    errorMessage: 'Start timestamp is not valid'
                },
                errorMessage: 'Start timestamp is not valid'
            },
            'endTimestamp': {
                in: 'body'
            },
            'delegate.partyType': {
                in: 'body',
                matches: {
                    options: ['^(INDIVIDUAL)$'],
                    errorMessage: 'Delegate Party Type is not valid'
                }
            },
            'delegate.givenName': {
                in: 'body',
                notEmpty: true,
                isLength: {
                    options: [{min: 1, max: 200}],
                    errorMessage: 'Delegate Given Name must be between 1 and 200 chars long'
                },
                matches: {
                    options: [REGULAR_CHARS],
                    errorMessage: 'Delegate Given Name contains illegal characters'
                },
                errorMessage: 'Delegate Given Name is not valid'
            },
            'delegate.familyName': {
                in: 'body',
                optional: true,
                isLength: {
                    options: [{min: 0, max: 200}],
                    errorMessage: 'Delegate Family Name must be between 0 and 200 chars long'
                },
                matches: {
                    options: [REGULAR_CHARS],
                    errorMessage: 'Delegate Family Name contains illegal characters'
                },
                errorMessage: 'Delegate Family Name is not valid'
            },
            'delegate.sharedSecretTypeCode': {
                in: 'body',
                notEmpty: true,
                matches: {
                    options: ['^(DATE_OF_BIRTH)$'],
                    errorMessage: 'Delegate Shared Secret Type Code is not valid'
                }
            },
            'delegate.sharedSecretValue': {
                in: 'body'
            }
        };

        validateReqSchema(req, schemaB2I)
            .then((req:Request) => {
                return PartyModel.findByIdentityIdValue(req.body.subjectIdValue);
            })
            .then((subjectParty) => {
                const relationshipAddDTO = new RelationshipAddDTO(
                    req.body.relationshipType,
                    req.body.subjectIdValue,
                    new CreateIdentityDTO(
                        undefined,
                        req.body.delegate.partyType,
                        req.body.delegate.givenName,
                        req.body.delegate.familyName,
                        req.body.delegate.unstructuredName,
                        req.body.delegate.sharedSecretTypeCode,
                        req.body.delegate.sharedSecretValue,
                        IdentityType.InvitationCode.code,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        ProfileProvider.Invitation.code
                    ),
                    req.body.startTimestamp ? new Date(req.body.startTimestamp) : undefined,
                    req.body.endTimestamp ? new Date(req.body.endTimestamp) : undefined,
                    AttributeDTO.build(req.body.attributes)
                );
                return subjectParty.addRelationship(relationshipAddDTO);
            })
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private findStatusByName = (req:Request, res:Response) => {
        const schema = {
            'name': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Name is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => RelationshipStatus.valueOf(req.params.code))
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private listStatuses = (req:Request, res:Response) => {
        const schema = {};
        validateReqSchema(req, schema)
            .then((req:Request) => RelationshipStatus.values())
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/relationship/:identifier',
            security.isAuthenticated,
            this.findByIdentifier);

        router.get('/v1/relationship/invitationCode/:invitationCode',
            security.isAuthenticated,
            this.findByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/claim',
            security.isAuthenticated,
            this.claimByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/accept',
            security.isAuthenticated,
            this.acceptByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/reject',
            security.isAuthenticated,
            this.rejectByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/notifyDelegate',
            security.isAuthenticated,
            this.notifyDelegateByInvitationCode);

        router.get('/v1/relationships/:subject_or_delegate/identity/:identity_id',
            security.isAuthenticated,
            this.searchBySubjectOrDelegate);

        // router.get('/v1/relationships/identity/:identity_id/subjects',
        //     security.isAuthenticated,
        //     this.searchDistinctSubjectsBySubjectOrDelegateIdentity);

        router.get('/v1/relationships/identity/:identity_id',
            security.isAuthenticated,
            this.searchByIdentity);

        router.post('/v1/relationship',
            security.isAuthenticated,
            this.create);

        router.get('/v1/relationshipStatus/:code',
            this.findStatusByName);

        router.get('/v1/relationshipStatuses',
            this.listStatuses);

        return router;

    };
}
