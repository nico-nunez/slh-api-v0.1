const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

const Confirmation = require('../models/Confirmation');
const { generateCode } = require('../helpers/utils');
const { getConfirmText } = require('./messages/messagesTxt');

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

const message = (msg) => console.log(msg);


// ------- MESSAGES --------

const getConfirmMsgs = async ( ucc ) => {
  const filePath = path.join(__dirname, 'messages', 'confirmation.html');
  const message = await fs.readFile(filePath, 'utf-8')
  const $ = cheerio.load(message);
  $('.verify-btn').prop('href', `http://localhost:8080/auth/confirmation/click?ucc=${ucc}`);
  
  const msgHTML = $.html();
  const msgText = getConfirmText(ucc);
  
  return {msgHTML, msgText};
}

const sendConfirmation = async (user) => {
  const uniqueCode = generateCode(100,'alphaNumeric', 'mixed');
  const { msgHTML, msgText } = await getConfirmMsgs(uniqueCode);
  const msg = {
    from: '"Santas Lil Helper" santas.lil.helper.app@gmail.com',
    to: user.email,
    subject: 'Verify Email Address',
    text: msgText,
    html: msgHTML
  }

  const newConfirm = new Confirmation({ ucc: uniqueCode, userID: user.id});
  await newConfirm.save();
  await transporter.sendMail(msg);
}


module.exports = { sendConfirmation, getConfirmMsgs }