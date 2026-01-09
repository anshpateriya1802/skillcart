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
 * Course Purchase Confirmation Email Template
 */
export const coursePurchasedTemplate = ({ userName, courseTitle, courseUrl, amount, currency = 'INR' }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - SkillCerts</title>
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">SkillCerts</h1>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background-color: #10b981; padding: 24px 40px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">✓</div>
              <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">Payment Successful!</h2>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px;">
              <p style="margin: 0 0 24px; color: #111827; font-size: 18px; font-weight: 600;">
                Hi ${escapeHTML(userName)},
              </p>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for your purchase! You're now enrolled in:
              </p>

              <!-- Course Card -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; line-height: 1.4;">
                  ${escapeHTML(courseTitle)}
                </h3>
              </div>

              ${amount ? `
              <!-- Payment Details -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h4 style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Payment Details</h4>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px;">Amount Paid:</td>
                    <td align="right" style="color: #111827; font-size: 16px; font-weight: 600;">${currency} ${escapeHTML(String(amount))}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px;">Status:</td>
                    <td align="right" style="color: #10b981; font-size: 14px; font-weight: 600;">Completed</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${escapeHTML(courseUrl)}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                      Start Learning Now →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's Next Section -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 20px; margin: 32px 0;">
                <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 600;">🚀 What's Next?</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                  <li>Access all video lectures and course materials</li>
                  <li>Learn at your own pace with lifetime access</li>
                  <li>Complete the course to earn your certificate</li>
                  <li>Join our community of learners</li>
                </ul>
              </div>

              <!-- Course Benefits -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
                <h4 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">Your Benefits:</h4>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                      ✓ Lifetime access to course content<br>
                      ✓ Certificate of completion<br>
                      ✓ Direct instructor support<br>
                      ✓ Mobile and desktop access
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Need help? Contact us at <a href="mailto:support@skillcerts.com" style="color: #667eea; text-decoration: none;">support@skillcerts.com</a>
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
                This email was sent to you because you made a purchase on SkillCerts.
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
