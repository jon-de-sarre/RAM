import * as mongoose from 'mongoose';
import {conf} from '../bootstrap';
import {doResetDataInMongo} from '../resetDataInMongo';

console.log('\nUsing mongo: ', conf.mongoURL, '\n');

export const connectDisconnectMongo = () => {

    beforeEach((done) => {
        mongoose.Promise = Promise as any;
        mongoose.connect(conf.mongoURL, {}, done);
    });

    afterEach((done) => {
        mongoose.connection.close(done);
    });

};

export const resetDataInMongo = () => {
    beforeEach((done) => {
        doResetDataInMongo(done);
    });
};
