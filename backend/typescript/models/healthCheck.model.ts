export interface IHealthCheck {
    status: number;
    message: string;
}

export class HealthCheck implements IHealthCheck {

    constructor(public status: number,
                public message: string) {
    }

}
