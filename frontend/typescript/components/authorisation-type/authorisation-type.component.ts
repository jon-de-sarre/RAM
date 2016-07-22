import {OnInit, Input, Output, EventEmitter, Component} from '@angular/core';
import {Validators, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FormControl, FORM_DIRECTIVES } from '@angular/forms';

@Component({
    selector: 'authorisation-type',
    templateUrl: 'authorisation-type.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES,FORM_DIRECTIVES]
})

export class AuthorisationTypeComponent implements OnInit {

    public form: FormGroup;

    @Input('data') public data: AuthorisationTypeComponentData;

    @Output('dataChange') public dataChanges = new EventEmitter<AuthorisationTypeComponentData>();

    @Output('isValid') public isValid = new EventEmitter<boolean>();

    constructor(private _fb: FormBuilder) { }

    public ngOnInit() {
        this.form = this._fb.group({
            'authType': [this.data.authType,
                Validators.compose([this.isAuthTypeSelected])
            ]
        });
        this.form.valueChanges.subscribe((v: AuthorisationTypeComponentData) => {
            this.dataChanges.emit(v);
            this.isValid.emit(this.form.valid);
        });
    }

    private isAuthTypeSelected = (authType: FormControl) => {
        return (authType.value === 'choose') ? { authorisationTypeNotSet: { valid: false } } : null;
    };
}

export interface AuthorisationTypeComponentData {
    authType: string;
}
