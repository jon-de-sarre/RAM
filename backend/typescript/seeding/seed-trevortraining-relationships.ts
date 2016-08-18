import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {RelationshipStatus, RelationshipInitiatedBy} from '../models/relationship.model';

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
                    subject: Seeder.trevortraining_party,
                    subjectNickName: Seeder.trevortraining_name,
                    delegate: Seeder.edtechosp_party,
                    delegateNickName: Seeder.edtechosp_name,
                    startTimestamp: Seeder.now,
                    status: RelationshipStatus.Accepted.code,
                    initiatedBy: RelationshipInitiatedBy.Delegate.code,
                    attributes: [
                        await Seeder.createRelationshipAttributeModel({
                            value: ['USI'],
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
