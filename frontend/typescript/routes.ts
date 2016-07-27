import {RouterConfig, provideRouter} from '@angular/router';

import {AccessDeniedComponent} from './pages/access-denied/access-denied.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';

import {WelcomeHomeComponent} from './pages/welcome-home/welcome-home.component';

import {RelationshipsComponent} from './pages/relationships/relationships.component';
import {AddRelationshipComponent} from './pages/add-relationship/add-relationship.component';
import {AddRelationshipCompleteComponent} from './pages/add-relationship-complete/add-relationship-complete.component';
import {EnterInvitationCodeComponent} from './pages/enter-invitation-code/enter-invitation-code.component';
import {AcceptAuthorisationComponent} from './pages/accept-authorisation/accept-authorisation.component';
import {RolesComponent} from './pages/roles/roles.component';

import {BusinessesComponent} from './pages/businesses/businesses.component';
import {NotificationsComponent} from './pages/notifications/notifications.component';
import {AddNotificationComponent} from './pages/add-notification/add-notification.component';
import {AgencySelectBusinessComponent} from './pages/agency-select-business/agency-select-business.component';

export const routes: RouterConfig = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    {
        path: 'home',
        component: WelcomeHomeComponent,
    },
    {
        path: 'home/:dashboard',
        component: WelcomeHomeComponent,
    },
    {
        path: 'home/:dashboard',
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
        path: 'roles/:idValue',
        component: RolesComponent
    },
    {
        path: 'businesses',
        component: BusinessesComponent
    },
    {
        path: 'notifications/:idValue',
        component: NotificationsComponent
    },
    {
        path: 'notifications/add/:idValue',
        component: AddNotificationComponent
    },
    {
        path: 'agency/selectBusiness/:dashboard',
        component: AgencySelectBusinessComponent
    },
    {
        path: '401',
        component: AccessDeniedComponent
    },
    {
        path: '404',
        component: NotFoundComponent
    },
    {
        path: '**',
        redirectTo: '404'
    }
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes)
];