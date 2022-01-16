function getMainConent(msgType, link) {

  const allMsgTypes = {

    //---- EMAIL CONFIRMATION ----
    emailConfirm: {
      html:
        `<h1 class="title">Verify Your Email Address</h1>
        <p>Welcome, and thank you for joining!</p>
        <p>Please verify your email address by clicking the link below.</p>
        <div class="btn-action">
          <a href="${link}" class="btn-action-link">verify email</a>
        </div>
        <p>
          This link is valid for 7 days.
        </p>`,

      text:
        `SANTA'S LIL' HELPER \n
            
        Verify Your Email Address
        
        Welcome, and thank you for joining!
        Please very the email address associated with your account by clicking the link below, or copy and paste it into your browser.
        
        ${link}
        
        This link is valid for 24 hours, and is only to confirm your account.
        
        We will not send any other messages unless specifically requested.
          
        If you did not sign up, or feel you've recieved this in error, please contact us at the below email address.
        
        Regards,
        The Lil' Helpers :)
        
        santas.lil.helper.app@gmail.com`

    },

    //---- RESET REQUEST ----
    resetRequest: {
      html:
        `<h1 class="title">Reset Password</h1>
        <p>A request to <strong>reset your current password</strong> has been made.  If you did not make this request please
          <a href="mailto: santas.lil.helper.app@gmail.com">contact us</a>.</p>
        <p>Otherwise, please click the below link to continue, or disregard if you have recalled your password.</p>
        <div class="btn-action">
          <a href="${link}" class="btn-action-link">reset pasword</a>
        </div>
        <p>
          <strong>This link is only valid for 1 hour</strong>.
        </p>`,
      
      text:
        `SANTA'S LIL' HELPER \n
        
        Verify Your Email Address
        
        Welcome, and thank you for joining!
        Please very the email address associated with your account by clicking the link below, or copy and paste it into your browser.
        
        ${link}
        
        This link is valid for 24 hours, and is only to confirm your account.
        
        We will not send any other messages unless specifically requested.
          
        If you did not sign up, or feel you've recieved this in error, please contact us at the below email address.
        
        Regards,
        The Lil' Helpers :)
        
        santas.lil.helper.app@gmail.com`
    }
  }


  const mainContent = allMsgTypes[msgType];

  return { 
    html: mainContent.html,
    text: mainContent.text
  }
}


module.exports = getMainConent;