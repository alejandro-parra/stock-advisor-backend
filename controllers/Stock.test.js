import { searchStock, getStockDetails } from './Stock';
import { connectToServer, getDatabase, closeDatabase } from '../services/Database';
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
    let payload = {
      userMail: 'herrera.hector1998@gmail.com',
      id: '60404ee32cbddc369a20d28b',
    }
    let token = jwt.sign(payload, key, {
        expiresIn: 604800
    });
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

});