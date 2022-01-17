function getMainConent(msgType, link) {

  const allMsgTypes = {

    //---- EMAIL VERIFICATION ----
    emailVerify: {
      html:
        `<h1 class="title">Verify Your Email Address</h1>
        <p>Hello!</p>
        <p>Please verify your email address by clicking the link below.</p>
        <div class="btn-action">
          <a href="${link}" class="btn-action-link">verify email</a>
        </div>
        <p>
          This link is only valid for 7 days.  You may request another if this link has already expired.
        </p>`,

      text:
        `SANTA'S LIL' HELPER \n
            
        Verify Your Email Address
        
        Hello!

        Please very the email address associated with your account by clicking the link below, or copy and paste it into your browser.
        
        ${link}
        
        This link is valid for 24 hours.
        You may request another if this link has already expired.
          
        If you did not make this request/change, or feel you've recieved this in error, please contact us at the below email address.
        
        Regards,
        The Lil' Helpers :)
        
        santas.lil.helper.app@gmail.com`

    },

    //---- RESET REQUEST ----
    resetRequest: {
      html:
        `<h1 class="title">Reset Password</h1>
        <p>Hello,</>
        <p>A request to <strong>reset your current password</strong> has been made.</p>
        <p>Please click the below link if you'd like to continue to reset your password.</p>
        <div class="btn-action">
          <a href="${link}" class="btn-action-link">reset pasword</a>
        </div>
        <p>
          <strong>This link is only valid for 1 hour</strong>.
        </p>`,
      
      text:
        `SANTA'S LIL' HELPER \n
        
        Reset Password
        
        Hello,

        A request to reset your current password has been made.
        
        Please click the below link if you'd like to continue to reset your password.
        
        ${link}
        
        This link is only valid for 1 hour.
          
        If you did not make this request/change, or feel you've recieved this in error, please contact us at the below email address.
        
        Regards,
        The Lil' Helpers :)
        
        santas.lil.helper.app@gmail.com`
    },

    emailUpdated: {
      html:
        `<h1 class="title">Email Address Updated</h1>
        <p>Hello,</p>
        <p>The message is to notify you that the email address associated with your account has been changed.</p>
        <p>A verification message has be sent to the updated email address.</p>
        <p>Please check your inbox/spam and click the link within to verify the change.</p>`,
      
      test:
        `SANTA'S LIL' HELPER \n
          
        Email Updated
        
        Hello,

        The message is to notify you that the email address associated with your account has been changed.
        A verification message has be sent to the updated email address.
        Please check your inbox/spam and click the link within to verify the change.

          
        If you did not make this request/change, or feel you've recieved this in error, please contact us at the below email address.
        
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