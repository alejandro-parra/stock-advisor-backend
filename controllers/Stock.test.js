import { searchStock, getStockDetails } from './Stock';
import { connectToServer, getDatabase, closeDatabase } from '../services/Database';
import { signToken } from './Utilities';
require('dotenv').config();
const jwt = require('jsonwebtoken'); 
var ObjectId = require('mongodb').ObjectID;
const key = process.env.KEY;

describe('Stock operations', ()=> {
  let db;
  
  // Tests

  it('Returns a set of data of a specific stock', async () => {
    let statusData = 0;
    let responseData = null;
    const send = (data) => {
      responseData = data;
      return;
    };
    const status = (data) => {
      statusData = data;
      return {
        send
      };
    };
    db = await connectToServer();
    const userMail = 'herrera.hector1998@gmail.com';
    const id = '60404ee32cbddc369a20d28b';
    const token = signToken(userMail, id);
    let test = {
      body: {
        stockCode: 'AAPL',
        userId: '6041883169c5bf075c1310e2',
      }, 
      headers: {
        'access-token': token
      }
    };

    let res = {
      status,
      send
    };

    await getStockDetails(test, res);
    expect(responseData).not.toBeNull();
    await closeDatabase();
  }, 20000);

  it('Returns a list of all available stocks when there is no search string', async () => {
    let statusData = 0;
    let responseData = null;
    const send = (data) => {
      responseData = data;
      return;
    };
    const status = (data) => {
      statusData = data;
      return {
        send
      };
    };
    db = await connectToServer();
    const userMail = 'herrera.hector1998@gmail.com';
    const id = '60404ee32cbddc369a20d28b';
    const token = signToken(userMail, id);
    let test = {
      body: {
        userId: '6041883169c5bf075c1310e2',
      }, 
      headers: {
        'access-token': token
      }
    };
    let res = {
      status,
      send
    };
    await searchStock(test, res);
    console.log(responseData);
    expect(responseData).not.toBeNull();
    await closeDatabase();
  }, 20000);

  it('Returns a single entry when searching for Apple (AAPL)', async () => {
    let statusData = 0;
    let responseData = null;
    const send = (data) => {
      responseData = data;
      return;
    };
    const status = (data) => {
      statusData = data;
      return {
        send
      };
    };
    db = await connectToServer();
    const userMail = 'herrera.hector1998@gmail.com';
    const id = '60404ee32cbddc369a20d28b';
    const token = signToken(userMail, id);
    let test = {
      body: {
        userId: '6041883169c5bf075c1310e2',
        searchString: 'Apple',
      }, 
      headers: {
        'access-token': token
      }
    };
    let res = {
      status,
      send
    };
    await searchStock(test, res);
    console.log(responseData);
    expect(responseData.length).toBe(1);
    await closeDatabase();
  }, 20000);

});