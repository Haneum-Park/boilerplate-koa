import { expect } from 'chai';
import COMMON_UTIL from '@util/commonUtil';
import dbInit from './dbInit';
import mongoose from 'mongoose';

describe('DBINITIALIZING', () => {
  before('try connect to MongoDB', async function connectDatabase() {
    await dbInit()
    await COMMON_UTIL.sleep(1000);
  });

  it('check mongoose Connection (default Connection)', () => {
    expect(mongoose.connection instanceof mongoose.Connection, "It's not a Instance of Connection").to.be.true;
    expect(mongoose.connection.readyState).to.equal(1);
  });
  
  // it('check mongoose Connection (caramella )', () => {
  //   expect(mongoose.oceanConnection instanceof mongoose.Connection, "It's not a Instance of Connection").to.be.true;
  //   expect(mongoose.oceanConnection?.readyState).to.equal(1);
  // });

});
 