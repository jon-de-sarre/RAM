import {OnInit, Input, Output, EventEmitter, Component} from '@angular/core';
import {Validators, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FormControl, FORM_DIRECTIVES } from '@angular/forms';
import {Utils} from '../../../../commons/ram-utils';
import {RAMNgValidators} from '../../commons/ram-ng-validators';

@Component({
    selector: 'access-period',
    templateUrl: 'access-period.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES,FORM_DIRECTIVES]
})
export class AccessPeriodComponent implements OnInit {

    public form: FormGroup;

    @Input('data') public data: AccessPeriodComponentData;

    @Output('dataChange') public dataChanges = new EventEmitter<AccessPeriodComponentData>();

    @Output('isValid') public isValid = new EventEmitter<boolean>();

    constructor(private _fb: FormBuilder) {
    }

    public ngOnInit() {
        this.form = this._fb.group({
            'startDate': [this.data.startDate,
                Validators.compose([Validators.required, RAMNgValidators.dateFormatValidator])],
            'endDate': [this.data.endDate,
                Validators.compose([RAMNgValidators.dateFormatValidator])],
            'noEndDate': [this.data.noEndDate]
        }, { validator: Validators.compose([this._isDateBefore('startDate', 'endDate')]) });

        let endDate = this.form.controls['endDate'] as FormControl;
        let noEndDate = this.form.controls['noEndDate'];

        noEndDate.valueChanges.subscribe((v: Boolean) => {
            if (v === true) {
                // reset endDate if noEndDate checkbox is selected
                endDate.updateValue(null);
            }
        });
        this.form.valueChanges.subscribe((v: AccessPeriodComponentData) => {
            this.dataChanges.emit(v);
            this.isValid.emit(this.form.valid);
        });
    }

    private _isDateBefore = (startDateCtrlName: string, endDateCtrlName: string) => {
        return (cg: FormGroup) => {
            let startDate = Utils.parseDate((cg.controls[startDateCtrlName] as FormControl).value);
            let endDate = Utils.parseDate((cg.controls[endDateCtrlName] as FormControl).value);

            return (startDate !== null && endDate !== null && startDate.getTime() > endDate.getTime()) ? {
                isEndDateBeforeStartDate: {
                    valid: false
                }
            } : null;
        };
    }
}

export interface AccessPeriodComponentData {
    startDate: Date;
    endDate?: Date;
    noEndDate: boolean;
}
