import * as mongoose from 'mongoose';
import * as mongooseAutoIncrement from 'mongoose-auto-increment';

const identityCounterCollectionName = 'identitycounters';
const identityCounterModelName = 'IdentityCounter';

/* tslint:disable:max-func-body-length */
export const doResetDataInMongo = (done?:() => void) => {
    mongooseAutoIncrement.initialize(mongoose.connection);
    mongoose.connection.db.listCollections().toArray((err:Error, collectionNames:[{name:string}]) => {
        const promises = collectionNames.map(function (collectionName) {
            return new Promise<string>(function (resolve, reject) {
                try {
                    const name = collectionName.name;
                    if (name.indexOf('.') === -1) {
                        // excluded system collections (like system.indexes)
                        if (name.toLowerCase() !== identityCounterCollectionName) {
                            mongoose.connection.db.dropCollection(name, (err:Error) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(name);
                                }
                            });
                        } else {
                            mongoose.model(identityCounterModelName).update(
                                {count: 1},
                                (err:Error, raw:Object) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(name);
                                    }
                                }
                            );
                        }
                    } else {
                        resolve(name);
                    }
                } catch (e) {
                    console.log('\nUnable to drop collection:', e);
                    reject(e);
                }
            });
        });
        if (done) {
            Promise.all(promises)
                .then(() => {
                    if (done) {
                        done();
                    }
                })
                .catch((err:Error) => {
                    console.log('\nUnable to drop mongo:', err);
                    if (done) {
                        done();
                    }
                });
        } else {
            return Promise.all(promises);
        }
    });
};
