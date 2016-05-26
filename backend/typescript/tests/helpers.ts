import * as mongoose from 'mongoose';

const mongoDbUrl = 'mongodb://localhost/ram-test';
console.log('\nUsing mongo: ', mongoDbUrl, '\n');

export function connectDisconnectMongo() {

    beforeEach((done) => {
        mongoose.connect(mongoDbUrl, {}, done);
    });

    afterEach((done) => {
        // mongoose.disconnect().then(done); // TODO: disconnect(fn) doesn't work !
        mongoose.connection.close(done);
    });

}

export function dropMongo() {
    beforeEach((done) => {
        mongoose.connection.db.dropDatabase(done);
    });
}