const crypto = require('crypto');

// -------------- Code Generator ------------

const alphaCode = (len, codeCase = "upper") => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let isLowerCase = codeCase === "lower" ? true : false;
	let code = "";

	for (let i = 0; i < len; i++) {
		const randCase = Boolean(crypto.randomInt(2));
		let randChar = chars[crypto.randomInt(chars.length)];
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
		code += digits[crypto.randomInt(digits.length)];
	}
	return code;
};

const alphaNumCode = (len, codeCase = "upper") => {
	let code = "";
	for (let i = 0; i < len; i++) {
		const randChar = crypto.randomInt(2) ? alphaCode(1, codeCase) : numericCode(1);
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

const avatars = [
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/blue-bear-min.png",
    description: 'blue bear'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/gingerbread-min.png",
    description: 'gingerbread'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/penguin-min.png",
    description: 'penguin'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/penguin1-min.png",
    description: 'penguin'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/polar-bear-min.png",
    description: 'polar bear'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/reindeer-min.png",
    description: 'reindeer'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/santa-min.png",
    description: 'santa claus'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/santa1-min.png",
    description: 'santa claus'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/snowman-min-1.png",
    description: 'snowman'
  },
  {
    srcURL:"https://santas-lil-helper-app.s3.us-east-2.amazonaws.com/images/avatars/profile/snowman-min.png",
    description: 'snowman'
  }
]


module.exports = {
	generateCode,
  avatars
};
