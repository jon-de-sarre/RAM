import {Seeder} from './seed';

// seeder .............................................................................................................

const now = new Date();

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class LegislativeProgramsSeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Legislative Programs:\n'.underline);

            Seeder.education_legislativeProgram = await Seeder.createLegislativeProgramModel({
                code: 'EDUCATION',
                shortDecodeText: 'Department of Education',
                longDecodeText: 'Department of Education',
                startDate: now
            } as any);

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
