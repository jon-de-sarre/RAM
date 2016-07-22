import {EventEmitter} from '@angular/core';

export class BannerService {

    public eventEmitter = new EventEmitter<String>();

    public subscribe(callback: (title: string) => void) {
        this.eventEmitter.subscribe(callback);
    }

    public setTitle(title: string) {
        this.eventEmitter.emit(title);
    }

}