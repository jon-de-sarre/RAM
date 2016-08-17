import {Seeder} from './seed';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class LegislativeProgramsSeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Legislative Programs:\n'.underline);

            Seeder.education_legislativeProgram = await Seeder.createLegislativeProgramModel({
                code: 'EDUCATION',
                shortDecodeText: 'Education program',
                longDecodeText: 'Education program',
                startDate: Seeder.now
            } as any);

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
