import {RouterConfig, provideRouter} from '@angular/router';

import {NotFoundComponent} from './components/not-found/not-found.component';
import {RelationshipsComponent} from './components/relationships/relationships.component';
import {AddRelationshipComponent} from './components/add-relationship/add-relationship.component';
import {AddRelationshipCompleteComponent} from './components/add-relationship-complete/add-relationship-complete.component';
import {EnterInvitationCodeComponent} from './components/enter-invitation-code/enter-invitation-code.component';
import {AcceptAuthorisationComponent} from './components/accept-authorisation/accept-authorisation.component';
import {WelcomeHomeComponent} from './components/welcome-home/welcome-home.component';

export const routes: RouterConfig = [
    {
        path: '',
        component: WelcomeHomeComponent,
    },
    {
        path: 'relationships/:idValue',
        component: RelationshipsComponent
    },
    {
        path: 'relationships/add/:idValue',
        component: AddRelationshipComponent
    },
    {
        path: 'relationships/add/complete/:idValue/:invitationCode/:displayName',
        component: AddRelationshipCompleteComponent
    },
    {
        path: 'relationships/add/enter/:idValue',
        component: EnterInvitationCodeComponent
    },
    {
        path: 'relationships/add/accept/:idValue/:invitationCode',
        component: AcceptAuthorisationComponent
    },
    {
        path: '404',
        component: NotFoundComponent
    }
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes)
];