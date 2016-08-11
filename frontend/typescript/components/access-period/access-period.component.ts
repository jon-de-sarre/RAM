import {OnInit, Input, Output, EventEmitter, Component} from '@angular/core';
import {Validators, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FormControl, FORM_DIRECTIVES } from '@angular/forms';
import {Utils} from '../../../../commons/ram-utils';
import {RAMNgValidators} from '../../commons/ram-ng-validators';
import {Calendar} from 'primeng/primeng';

@Component({
    selector: 'access-period',
    templateUrl: 'access-period.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES,FORM_DIRECTIVES,Calendar]
})
export class AccessPeriodComponent implements OnInit {

    public form: FormGroup;

    @Input('data') public data: AccessPeriodComponentData;

    @Output('dataChange') public dataChanges = new EventEmitter<AccessPeriodComponentData>();

    @Output('isValid') public isValid = new EventEmitter<boolean>();

    constructor(private _fb: FormBuilder) {
    }

    public ngOnInit() {
        const startDate = this.data.startDate;
        const endDate = this.data.endDate;
        const formattedStartDate:string = startDate === null ? null : startDate.toISOString().slice(0, 10);
        const formattedEndDate:string = endDate === null ? null : endDate.toISOString().slice(0, 10);
        this.form = this._fb.group({
            'startDate': [formattedStartDate,
                Validators.compose([Validators.required, RAMNgValidators.dateFormatValidator])],
            'endDate': [formattedEndDate,
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
