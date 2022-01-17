const nodemailer = require('nodemailer');
const Link = require('../models/Link');
const Email = require('./messages/Email');

const dataEmailVerify = {
  codeLen: 150,
  type: 'emailVerify',
  subject: 'Verify Email Address',
  route: '/auth/verification/email',
  expireAt: 1000 * 60 * 60 * 24 * 7
}
const dataEmailUpdated = {
  codeLen: null,
  type: 'emailUpdated',
  subject: 'Email Address Updated',
  route: null,
  expireAt: null
}

const dataResetRequest = {
  codeLen: 200,
  type: 'resetRequest',
  subject: 'Reset Password Requested',
  route: '/auth/password/reset/update',
  expireAt: 1000 * 60 * 60 
}
const dataResetUpdated = {
  codeLen: null,
  type: 'emailUpdated',
  subject: 'Password Reset Complete',
  route: null,
  expireAt: null
}

const allMsgTypes = {
  emailVerify: new Email(dataEmailVerify),
  emailUpdated: new Email(dataEmailUpdated),
  resetRequest: new Email(dataResetRequest),
  resetUpdated: new Email(dataResetUpdated)
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

const createMessage = async(user, msgType, altAddress) => {
  const msg = allMsgTypes[msgType];
  const code = msg.codeLen ? msg.generateLinkCode() : null;
  const { msgHTML, msgText } = await msg.getMsgContent(code);
  const emailTo = altAddress ? altAddress : user.email.address;
  const message = {
    from: '"Santas Lil Helper" santas.lil.helper.app@gmail.com',
    to: emailTo,
    subject: msg.subject,
    text: msgText,
    html: msgHTML
  }
  const linkData = code ? {
    code,
    type: msgType,
    referenceID: user.id,
    expireAt: Date.now() + msg.expireAt
  } : null;
  return { message, linkData }
}


const sendEmailLink = async (user, msgType, altAddress=false) => {
  const { message, linkData } = await createMessage(user, msgType, altAddress);
  let sentLink = null;
  if(linkData) {
    const newLink = new Link(linkData);
    sentLink = await newLink.save();
  }
  transporter.sendMail(message);
  return sentLink;
}


module.exports = { sendEmailLink }