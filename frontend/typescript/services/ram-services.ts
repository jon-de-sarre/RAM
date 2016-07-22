import {Injectable} from '@angular/core';

import {RAMRestService} from './ram-rest.service';
import {RAMModelService} from './ram-model.service';
import {RAMRouteHelper} from '../commons/ram-route-helper';
import {BannerService} from '../components/banner/banner.service';

@Injectable()
export class RAMServices {

    constructor(public rest: RAMRestService,
                public model: RAMModelService,
                public route: RAMRouteHelper,
                public banner: BannerService) {
    }

}