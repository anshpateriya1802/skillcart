/**
 * Helper function to escape HTML characters
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (char) => {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[char];
  });
}

/**
 * Welcome Email Template
 */
export const welcomeTemplate = ({ userName, userEmail }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SkillCerts</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎓</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to SkillCerts!</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px;">
              <p style="margin: 0 0 24px; color: #111827; font-size: 18px; font-weight: 600;">
                Hi ${escapeHTML(userName)},
              </p>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Welcome to SkillCerts! We're thrilled to have you join our community of learners and professionals committed to continuous growth.
              </p>

              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your account has been successfully created with <strong>${escapeHTML(userEmail)}</strong>
              </p>

              <!-- What You Can Do -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); border-radius: 8px; padding: 24px; margin: 32px 0;">
                <h3 style="margin: 0 0 16px; color: #1e40af; font-size: 18px; font-weight: 600;">🚀 Get Started</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #4b5563; font-size: 14px; line-height: 1.8;">
                      ✓ Browse hundreds of expert-led courses<br>
                      ✓ Learn at your own pace, anytime, anywhere<br>
                      ✓ Earn verifiable certificates upon completion<br>
                      ✓ Track your learning progress
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 32px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6; text-align: center;">
                Ready to start your learning journey?<br>
                <span style="color: #9ca3af;">Your future self will thank you!</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} SkillCerts. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Need help? Reach out at <a href="mailto:support@skillcerts.com" style="color: #667eea; text-decoration: none;">support@skillcerts.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
