const getConfirmText = link => `
SANTA'S LIL' HELPER \n

Verify Your Email Address

Welcome, and thank you for joining!
Please very the email address associated with your account by clicking the link below, or copy and paste it into your browser.

${link}

This link is valid for 24 hours, and is only to confirm your account.

We will not send any other messages unless specifically requested.
  
If you did not sign up, or feel you've recieved this in error, please contact us at the below email address.

Regards,
The Lil' Helpers :)

santas.lil.helper.app@gmail.com
`

const getResetText = link => `
SANTA'S LIL' HELPER \n

Reset Password

A request to reset your current password has been made.  If you did not make this request please
contact us at the email address at the bottom of this message.

Otherwise, please click the link to continue, or disregard if you have recalled your password.

${link}

Regards,
The Lil' Helpers : )

PS:
This link is only valid 1 hour.
`

module.exports = {
  getConfirmText,
  getResetText
}