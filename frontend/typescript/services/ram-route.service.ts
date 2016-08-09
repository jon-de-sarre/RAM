import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable()
export class RAMRouteService {

    constructor(private router: Router) {
    }

    public goToHomePage() {
        this.router.navigate(['/home']);
    }

    public goToAccessDeniedPage() {
        this.router.navigate(['/403']);
    }

    public goToAuthorisationsHomePage() {
        this.router.navigate(['/home/auth']);
    }

    public goToSoftwareServicesProviderHomePage() {
        this.router.navigate(['/home/sps']);
    }

    public goToRelationshipsPage(idValue: string, filter?: string, page?: number, msg?: string) {
        const queryParams = {};
        if (filter) {
            queryParams['filter'] = filter;
        }
        if (page) {
            queryParams['page'] = page;
        }
        if (msg) {
            queryParams['msg'] = msg;
        }
        this.router.navigate(['/relationships',
                encodeURIComponent(idValue)],
            {queryParams: queryParams}
        );
    }

    public goToAddRelationshipPage(idValue: string) {
        this.router.navigate(['/relationships/add',
            encodeURIComponent(idValue)
        ]);
    }

    public goToEditRelationshipPage(idValue: string, key: string) {
        this.router.navigate(['/relationships/edit',
            encodeURIComponent(idValue),
            encodeURIComponent(key)
        ]);
    }

    public goToRelationshipAddCompletePage(idValue: string, code: string, displayName: string) {
        this.router.navigate(['/relationships/add/complete',
            encodeURIComponent(idValue),
            encodeURIComponent(code),
            encodeURIComponent(displayName)
        ]);
    }

    public goToRelationshipEnterCodePage(idValue: string, msg?: string) {
        const queryParams = {};
        if (msg) {
            queryParams['msg'] = msg;
        }
        this.router.navigate(['/relationships/add/enter',
                encodeURIComponent(idValue)
            ], {queryParams: queryParams}
        );
    }

    public goToRelationshipAcceptPage(idValue: string, code: string) {
        this.router.navigate(['/relationships/add/accept',
            encodeURIComponent(idValue),
            encodeURIComponent(code)
        ]);
    }

    public goToRolesPage(href: string, page?: number) {
        const queryParams = {};
        if (page) {
            queryParams['page'] = page;
        }
        this.router.navigate(['/roles',
                encodeURIComponent(href)
            ], {queryParams: queryParams}
        );
    }

    public goToAddRolePage(href: string) {
        this.router.navigate(['/roles/add',
                encodeURIComponent(href)
            ], {queryParams: {}}
        );
    }

    public goToEditRolePage(identityHref: string, roleHref: string) {
        this.router.navigate(['/roles/edit',
                encodeURIComponent(identityHref),
                encodeURIComponent(roleHref)
            ], {queryParams: {}}
        );
    }

    public goToBusinessesPage(filter?: string, page?: number) {
        const queryParams = {};
        if (filter) {
            queryParams['filter'] = filter;
        }
        if (page) {
            queryParams['page'] = page;
        }
        this.router.navigate(['/businesses'],
            {queryParams: queryParams}
        );
    }

    public goToNotificationsPage(idValue: string) {
        this.router.navigate(['/notifications/',
                encodeURIComponent(idValue)
            ], {queryParams: {}}
        );
    }

    public goToAddNotificationPage(idValue: string) {
        this.router.navigate(['/notifications/add/',
            encodeURIComponent(idValue)
        ]);
    }

    public goToEditNotificationPage(idValue: string, key: string) {
        this.router.navigate(['/notifications/edit/',
            encodeURIComponent(idValue),
            encodeURIComponent(key)
        ]);
    }

    public goToAgencySelectBusinessForAuthorisationsPage() {
        this.router.navigate(['/agency/selectBusiness/auth']);
    }

    public goToAgencySelectBusinessForSoftwareProviderServicesPage() {
        this.router.navigate(['/agency/selectBusiness/sps']);
    }

}