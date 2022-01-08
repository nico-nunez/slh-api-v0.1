const SecretSanta = require('../models/Selection');

function filterPool(picker, allMembers) {
    const pool = []
    for (const member of allMembers) {
        if (picker.profileName === member.profileName) continue;
        if (picker.exceptions.indexOf(member.profileName) !== -1) continue
        pool.push(member);
    }
    return pool;
}

function randomRecipient(selector, participantPool ) {
    const filteredPool = filterPool(selector, participantPool)
    if (!filteredPool.length) return null;
    const randNum = Math.floor(Math.random() * filteredPool.length);
    const randomRecipient = filteredPool[randNum];
    return randomRecipient;
}

// ----- NOT USED ? ----
// function updatePool(selector, recipient, allMembers) {
//     const updatedPool = []
//     for (const person of mainPool) {
//         if (person.name === recipient.name) {
//             person.isAvailable = false;
//         } else if (person.name === selector.name) {
//             person.recipient = recipient;
//         }
//         updatedPool.push(person);
//     }
//     return updatedPool;
// }

function getSelections(allMembers, partyID) {
    let availableMembers = [...allMembers]
    let results = [];
    for (const selector of allMembers) {
        const recipient = randomRecipient(member, availableMembers)
        if(!recipient) {
            secretSantaSelector(allMembers, partyID)
        } else {
            const selection = new SecretSanta({
                selector,
                recipient,
                party: partyID
            })
            results.push(selection);
            availableMembers = availableMembers.filter(member => member.username !== recipient.username);
        }
    }
    return results;
}


// -------------- Code Generator ------------
const randInt = (maxNum, minNum=0) => {
  return Math.floor((Math.random() * maxNum) + minNum);
};

const alphaCode = (len, codeCase='upper') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let isLowerCase = codeCase === 'lower' ? true : false;
  let code = '';

  for(let i=0; i<len; i++) {
    const randCase = Boolean(randInt(2));
    let randChar = chars[randInt(chars.length)];
    isLowerCase = codeCase === 'mixed' ? randCase : isLowerCase;

    randChar = isLowerCase ? randChar.toLowerCase() : randChar;

    code += randChar;
  }
  return code;
};

const numericCode = (len) => {
  const digits = '0123456789';
  let code = '';

  for (let i=0; i<len; i++) {
    code += digits[randInt(digits.length)];
  }
  return code;
}

const alphaNumCode = (len, codeCase='upper') => {
  let code = '';

  for (let i=0; i<len; i++) {
    const randChar = randInt(2) ? alphaCode(1, codeCase) : numericCode(1);
    code += randChar;
  }
  return code;
}

const generateCode = (len, codeType, alphaCase='upper') => {
  const minLen = Math.max(1, len);
  const actualLength = Math.min(minLen, 2000);

  if (codeType === 'alpha')
    return alphaCode(actualLength, alphaCase);
  
  if (codeType === 'numeric')
    return numericCode(actualLength);
  
  if (codeType === 'alphaNumeric')
    return alphaNumCode(actualLength, alphaCase);
}

module.exports = {
  getSelections,
  generateCode
}