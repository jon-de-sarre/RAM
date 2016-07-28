import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {RelationshipStatus} from '../models/relationship.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class EdTechRelationshipsSeeder {

    private static async load_edtech_associate() {
        try {

            Seeder.log('\nInserting Sample Relationship - Ed Tech Pty Ltd / Ed Oaner:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.edtech_and_edoaner_relationship = await Seeder.createRelationshipModel({
                    relationshipType: Seeder.associate_delegate_relationshipType,
                    subject: Seeder.edtech_party,
                    subjectNickName: Seeder.edtech_name,
                    delegate: Seeder.edoaner_party,
                    delegateNickName: Seeder.edoaner_name,
                    startTimestamp: new Date(),
                    status: RelationshipStatus.Active.code,
                    attributes: [
                        await Seeder.createRelationshipAttributeModel({
                            value: true,
                            attributeName: Seeder.permissionCustomisationAllowedInd_attributeName
                        } as any),
                        await Seeder.createRelationshipAttributeModel({
                            value: true,
                            attributeName: Seeder.delegateManageAuthorisationAllowedInd_attributeName
                        } as any),
                        await Seeder.createRelationshipAttributeModel({
                            value: true,
                            attributeName: Seeder.delegateRelationshipTypeDeclaration_attributeName
                        } as any),
                        await Seeder.createRelationshipAttributeModel({
                            value: true,
                            attributeName: Seeder.subjectRelationshipTypeDeclaration_attributeName
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
        await EdTechRelationshipsSeeder.load_edtech_associate();
    }

}
