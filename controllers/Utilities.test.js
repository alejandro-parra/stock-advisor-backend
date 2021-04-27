const { sendEmail, signToken } = require('./Utilities');
require('dotenv').config();

describe('send mail', () => {

  it('sends email with valid data', async () => {
    const from = 'alexparra07@gmail.com';
    const to = 'alexparra_07@hotmail.com';
    const subject = 'Test email';
    const html = '<p>Hello this is a test</p>';
    let response = await sendEmail(from, to , subject, html);
    expect(response).toBe('success');
  }, 10000);

  it('gets an error when pasing invalid email', async () => {
    const from = 'alexparra07@gmail.com';
    const to = 'fake email';
    const subject = 'Test email';
    const html = '<p>Hello this is a test</p>';
    let errors = null
    await sendEmail(from, to , subject, html).catch((err) => {
      errors = err;
    });
    expect(errors).toBeTruthy();
  }, 10000);
});

describe('Sign token function', () => {
  it('returns a token string', () => {
    let email = 'herrera.hector1998@gmail.com';
    let id = '60404ee32cbddc369a20d28b';
    const result = signToken(email, id);
    expect(result).toBeTruthy();
  });
});