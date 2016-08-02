import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {RelationshipStatus} from '../models/relationship.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class TrevorTrainingRelationshipsSeeder {

    private static async load_trevortraining_associate() {
        try {

            Seeder.log('\nInserting Sample Relationship - Trevor Training / Ed Tech:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.trevortraining_and_edtech_relationship = await Seeder.createRelationshipModel({
                    relationshipType: Seeder.osp_delegate_relationshipType,
                    subject: Seeder.edtech_party,
                    subjectNickName: Seeder.edtech_name,
                    delegate: Seeder.trevortraining_party,
                    delegateNickName: Seeder.trevortraining_name,
                    startTimestamp: new Date(),
                    status: RelationshipStatus.Active.code,
                    attributes: [
                        await Seeder.createRelationshipAttributeModel({
                            value: true,
                            attributeName: Seeder.selectedGovernmentServicesList_relAttributeName
                        } as any),
                        await Seeder.createRelationshipAttributeModel({
                            value: 'mySSID-1234',
                            attributeName: Seeder.ssid_relAttributeName
                        } as any)
                    ]
                } as any);

                Seeder.log('');

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

    public static async load() {
        await TrevorTrainingRelationshipsSeeder.load_trevortraining_associate();
    }

}
