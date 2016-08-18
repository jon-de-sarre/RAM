import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {RelationshipStatus, RelationshipInitiatedBy} from '../models/relationship.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class TrungTrainingRelationshipsSeeder {

    private static async load_trungtraining_associate() {
        try {

            Seeder.log('\nInserting Sample Relationship - Trung Training / Ed Tech:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.trungtraining_and_edtech_relationship = await Seeder.createRelationshipModel({
                    relationshipType: Seeder.osp_delegate_relationshipType,
                    subject: Seeder.trungtraining_party,
                    subjectNickName: Seeder.trungtraining_name,
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
                            value: ['mySSIDforEdTech-SoftProd1','mySSIDforEdTech-SoftProd2'],
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
        await TrungTrainingRelationshipsSeeder.load_trungtraining_associate();
    }

}
