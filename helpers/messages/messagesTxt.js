const getConfirmText = confirmCode => `
SANTA'S LIL' HELPER \n

Verify Your Email Address

Welcome, and thank you for joining!
Please very the email address associated with your account by clicking the link below, or copy and paste it into your browser.

http://localhost:8080/auth/confirmation/email?ucc=${confirmCode}

This link is valid for 24 hours, and is only to confirm your account.

We will not send any other messages unless specifically requested.
  
If you did not sign up, or feel you've recieved this in error, please contact us at the below email address.

Regards,
The Lil' Helpers :)

santas.lil.helper.app@gmail.com
`

module.exports = {
  getConfirmText
}