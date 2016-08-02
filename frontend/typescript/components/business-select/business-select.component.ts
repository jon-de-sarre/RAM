import {Output, EventEmitter, Component} from '@angular/core';
import {REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES } from '@angular/forms';
import {ABRentry} from '../../../../commons/abr';
import {RAMRestService} from '../../services/ram-rest.service';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'business-select',
    templateUrl: 'business-select.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES,FORM_DIRECTIVES]
})
export class BusinessSelectComponent {

    public abn_or_name = '';
    public new_search = true;
    public businesses:ABRentry[] = [];
    public isLoading = false;
    public selectedBusiness:ABRentry = null;

    @Output('dataChange') public dataChanges = new EventEmitter<ABRentry>();
    @Output('error') public errorEvent = new EventEmitter<string[]>();

    constructor(private rest: RAMRestService) {}

    private display(abrListObservable:Observable<ABRentry[]>) {
        this.isLoading = true;
        this.selectedBusiness = null;
        abrListObservable.subscribe(
            (abrs: ABRentry[]) => {
                if (abrs) {
                    this.businesses = abrs;
                    this.isLoading = false;
                    if (this.businesses.length === 1) {
                        this.selectBusiness(this.businesses[0]);
                        this.new_search = true;
                    }
                }
            },
            (err) => {
                this.errorEvent.emit(this.rest.extractErrorMessages(err));
                    this.isLoading = false;
            }
        );
    }

    public selectBusiness(business:ABRentry) {
        if (!this.selectedBusiness) {
            this.new_search = true;
            this.dataChanges.emit(business);
            this.selectedBusiness = business;
            this.businesses = [this.selectedBusiness];
        }
    }

    public findCompanies() {
        if (this.new_search && this.abn_or_name.length) {
            this.new_search = false;
            this.businesses = [];
            if (/^(\d *?){11}$/.test(this.abn_or_name)) {
                const abn = this.abn_or_name.replace(/\s+/g, '');
                this.display(this.rest.getABRfromABN(abn));
            } else {
                this.display(this.rest.getABRfromName(this.abn_or_name));
            }
        }
    }

    public valueChange() { this.new_search = true; }
}
