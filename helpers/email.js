const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

const Link = require('../models/Link');
const { generateCode } = require('../helpers/utils');
const { getConfirmText, getResetText } = require('./messages/messagesTxt');

const msgTypes = {
  confirmation: {
    len: 150,
    html: 'confirmation.html',
    text: getConfirmText,
    path: '/confirmation/email',
    subject: 'Verify Email Address',
    validFor: 1000 * 60 * 60 * 24 * 7
  },
  reset: {
    len: 200,
    html: 'reset.html',
    text: getResetText,
    path: '/password/reset/update',
    subject: 'Password Reset',
    validFor: 1000 * 60 * 60
  }
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



const getMsgContent = async ( msgObj ) => {
  const code = generateCode(msgObj.len, 'alphaNumeric', 'mixed');
  const msgLink = `http://localhost:8080/auth${msgObj.path}?ulc=${code}`;

  const filePath = path.join(__dirname, 'messages', msgObj.html);
  const fileHTML = await fs.readFile(filePath, 'utf-8')
  const $ = cheerio.load(fileHTML);
  $('.btn-action-link').prop('href', msgLink);
  
  const msgHTML = $.html();
  const msgText = msgObj.text(msgLink);
  
  return {msgHTML, msgText, code};
}

const sendEmailLink = async (user, msgType) => {
  const msgObj = msgTypes[msgType];
  const { msgHTML, msgText, code } = await getMsgContent(msgObj);
  const msg = {
    from: '"Santas Lil Helper" santas.lil.helper.app@gmail.com',
    to: user.email,
    subject: msgObj.subject,
    text: msgText,
    html: msgHTML
  }
  const details = {
    code,
    subject: msgType,
    referenceID: user.id,
    expireAt: Date.now() + msgObj.validFor
  }

  transporter.sendMail(msg);

  return details;
}


module.exports = { sendEmailLink }