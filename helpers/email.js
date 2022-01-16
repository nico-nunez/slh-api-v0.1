const nodemailer = require('nodemailer');

const { generateCode } = require('../helpers/utils');
const Email = require('./messages/Email');

const emailConfirmData = {
  codeLen: 150,
  type: 'emailConfirm',
  subject: 'Verify Email Address',
  route: '/auth/confirmation/email',
  expireAt: 1000 * 60 * 60 * 24 * 7
}

const resetRequestData = {
  codeLen: 200,
  type: 'resetRequest',
  subject: 'Password Reset Request',
  route: '/auth/password/reset/update',
  expireAt: 1000 * 60 * 60 
}

const allMsgTypes = {
  emailConfirm: new Email(emailConfirmData),
  resetRequest: new Email(resetRequestData),
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAUTH2',
    user: 'santas.lil.helper.app@gmail.com',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
  }
})


const sendEmailLink = async (user, msgType) => {
  const msg = allMsgTypes[msgType];
  const code = msg.generateLinkCode();
  const { msgHTML, msgText } = await msg.getMsgContent(code);
  const message = {
    from: '"Santas Lil Helper" santas.lil.helper.app@gmail.com',
    to: user.email,
    subject: msg.subject,
    text: msgText,
    html: msgHTML
  }
  const details = {
    code,
    type: msgType,
    referenceID: user.id,
    expireAt: Date.now() + msg.expireAt
  }

  transporter.sendMail(message);

  return details;
}


module.exports = { sendEmailLink }