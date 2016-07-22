import {Injectable} from '@angular/core';

import {RAMRestService} from './ram-rest.service';
import {RAMModelService} from './ram-model.service';
import {RAMRouteService} from './ram-route.service';
import {BannerService} from '../components/banner/banner.service';

@Injectable()
export class RAMServices {

    constructor(public rest: RAMRestService,
                public model: RAMModelService,
                public route: RAMRouteService,
                public banner: BannerService) {
    }

}