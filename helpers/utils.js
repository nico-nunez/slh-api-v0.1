function randomRecipient(selector, members, exceptions=[]) {
  const randIndex = Math.floor(Math.random() * members.length);
  let recipient = members[randIndex];
  const isSameUser = recipient.id === selector.id;
  if (members.length === 1 && isSameUser) {
    return null;
  }
  if (isSameUser) {
    recipient = randomRecipient(selector, members);
  }
	return recipient;
}

function getSelections(members) {
	let availableMembers = [...members];
	let results = [];
	for (const selector of members) {
		const recipient = randomRecipient(selector, availableMembers);
		if (!recipient) {
			results = getSelections(members);
		} else {
			const selection = {
				selector,
				recipient
			};
			results.push(selection);
			availableMembers = availableMembers.filter(
				member => member.id !== recipient.id
			);
		}
	}
	return results;
}

// -------------- Code Generator ------------
const randInt = (maxNum, minNum = 0) => {
	return Math.floor(Math.random() * maxNum + minNum);
};

const alphaCode = (len, codeCase = "upper") => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let isLowerCase = codeCase === "lower" ? true : false;
	let code = "";

	for (let i = 0; i < len; i++) {
		const randCase = Boolean(randInt(2));
		let randChar = chars[randInt(chars.length)];
		isLowerCase = codeCase === "mixed" ? randCase : isLowerCase;
		randChar = isLowerCase ? randChar.toLowerCase() : randChar;
		code += randChar;
	}
	return code;
};

const numericCode = (len) => {
	const digits = "0123456789";
	let code = "";
	for (let i = 0; i < len; i++) {
		code += digits[randInt(digits.length)];
	}
	return code;
};

const alphaNumCode = (len, codeCase = "upper") => {
	let code = "";
	for (let i = 0; i < len; i++) {
		const randChar = randInt(2) ? alphaCode(1, codeCase) : numericCode(1);
		code += randChar;
	}
	return code;
};

const generateCode = (len, codeType, alphaCase = "upper") => {
	const minLen = Math.max(1, len);
	const actualLength = Math.min(minLen, 2000);
	if (codeType === "alpha") return alphaCode(actualLength, alphaCase);
	if (codeType === "numeric") return numericCode(actualLength);
	if (codeType === "alphaNumeric") return alphaNumCode(actualLength, alphaCase);
};

module.exports = {
	getSelections,
	generateCode,
};
