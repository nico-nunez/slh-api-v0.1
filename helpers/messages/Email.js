const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

const getMainConent = require('./mainContent')
const { generateCode } = require('../utils');


class Email {
  constructor(data) {
    this.codeLen = data.codeLen,
    this.type = data.type,
    this.subject = data.subject,
    this.route = data.route,
    this.expireAt = data.expireAt
  }

  async getMsgContent(code) {
    const baseURL = process.env.BASE_URL;
    const link = baseURL + this.route + '?ulc=' + code;
  
    const mainContent = getMainConent(this.type, link);
  
    const filePath = path.join(__dirname, 'base.html');
    const baseHTML = await fs.readFile(filePath, 'utf-8')
    const $ = cheerio.load(baseHTML);
    $('.content-main').html(mainContent.html);

    const msgHTML = $.html();
    const msgText = mainContent.text;
    
    return { msgHTML, msgText };
  }

  generateLinkCode(){
    return generateCode(this.codeLen, 'alphaNumeric', 'mixed');
  }
}

module.exports = Email;