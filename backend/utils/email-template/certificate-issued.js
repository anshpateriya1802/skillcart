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
 * Certificate Issued Email Template
 */
export const certificateIssuedTemplate = ({ userName, courseTitle, certificateUrl, certificateId }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Certificate is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Congratulations!</h1>
              <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 16px;">Your Certificate is Ready</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px;">
              <p style="margin: 0 0 24px; color: #111827; font-size: 18px; font-weight: 600;">
                Hi ${escapeHTML(userName)},
              </p>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Congratulations on completing your course! You've demonstrated dedication and commitment to learning.
              </p>

              <!-- Course Badge -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                <div style="font-size: 40px; margin-bottom: 12px;">📜</div>
                <h3 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; line-height: 1.4;">
                  ${escapeHTML(courseTitle)}
                </h3>
              </div>

              <!-- Certificate Details -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Certificate ID</td>
                  </tr>
                  <tr>
                    <td style="color: #111827; font-size: 16px; font-family: 'Courier New', monospace; font-weight: 600;">
                      ${escapeHTML(certificateId)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${escapeHTML(certificateUrl)}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                      View Certificate →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Share Section -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin: 32px 0; text-align: center;">
                <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 600;">📢 Share Your Achievement</h4>
                <p style="margin: 0; color: #3b82f6; font-size: 14px; line-height: 1.6;">
                  Showcase your new skills on LinkedIn, your resume, or portfolio!
                </p>
              </div>

              <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Keep learning and growing! 🌟
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
                Verify this certificate at: ${escapeHTML(certificateUrl)}
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
