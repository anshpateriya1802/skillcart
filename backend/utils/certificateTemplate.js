/**
 * Generate beautiful HTML certificate
 */
export const generateCertificateHTML = (data) => {
  const { userName, courseTitle, completionDate, certificateId, instructorName } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${courseTitle}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .certificate-container {
      background: white;
      width: 100%;
      max-width: 1000px;
      padding: 60px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      position: relative;
      border-radius: 8px;
    }

    .certificate-border {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 4px solid #667eea;
      border-radius: 4px;
      pointer-events: none;
    }

    .certificate-border::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      border: 2px solid #a29bfe;
      border-radius: 2px;
    }

    .certificate-content {
      position: relative;
      z-index: 1;
      text-align: center;
    }

    .logo {
      margin-bottom: 20px;
    }

    .logo h1 {
      font-size: 32px;
      color: #667eea;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .certificate-title {
      margin-bottom: 10px;
    }

    .certificate-title h2 {
      font-size: 56px;
      color: #2d3436;
      font-weight: bold;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .certificate-subtitle {
      font-size: 24px;
      color: #636e72;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 30px;
    }

    .divider {
      width: 200px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #667eea, transparent);
      margin: 30px auto;
    }

    .awarded-to {
      font-size: 18px;
      color: #636e72;
      margin-bottom: 15px;
      font-style: italic;
    }

    .recipient-name {
      font-size: 48px;
      color: #2d3436;
      font-weight: bold;
      margin-bottom: 25px;
      padding: 0 20px;
      text-transform: capitalize;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .completion-text {
      font-size: 18px;
      color: #636e72;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .course-name {
      font-size: 32px;
      color: #667eea;
      font-weight: bold;
      margin: 20px 0 40px;
      padding: 0 40px;
      line-height: 1.4;
    }

    .certificate-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 60px;
      padding: 0 40px;
    }

    .date-section, .signature-section {
      flex: 1;
    }

    .date-section {
      text-align: left;
    }

    .signature-section {
      text-align: right;
    }

    .label {
      font-size: 14px;
      color: #636e72;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .value {
      font-size: 18px;
      color: #2d3436;
      font-weight: bold;
    }

    .signature-line {
      width: 200px;
      height: 2px;
      background: #2d3436;
      margin: 0 0 8px auto;
    }

    .certificate-id {
      margin-top: 50px;
      text-align: center;
      padding-top: 20px;
      border-top: 2px dashed #dfe6e9;
    }

    .certificate-id-label {
      font-size: 12px;
      color: #b2bec3;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }

    .certificate-id-value {
      font-size: 14px;
      color: #636e72;
      font-family: 'Courier New', monospace;
      font-weight: bold;
    }

    .actions {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 1000;
    }

    .btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c5ce7;
    }

    .btn-secondary:hover {
      background: #5f4dd1;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .certificate-container {
        box-shadow: none;
        max-width: 100%;
        margin: 0;
      }

      .actions {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .certificate-container {
        padding: 40px 20px;
      }

      .certificate-title h2 {
        font-size: 36px;
      }

      .recipient-name {
        font-size: 32px;
      }

      .course-name {
        font-size: 24px;
        padding: 0 20px;
      }

      .certificate-footer {
        flex-direction: column;
        gap: 30px;
        padding: 0 20px;
      }

      .signature-section {
        text-align: left;
      }

      .signature-line {
        margin: 0 0 8px 0;
      }

      .actions {
        position: static;
        margin-bottom: 20px;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="window.print()">
      📥 Download PDF
    </button>
    <button class="btn btn-secondary" onclick="window.close()">
      ✕ Close
    </button>
  </div>

  <div class="certificate-container">
    <div class="certificate-border"></div>
    
    <div class="certificate-content">
      <div class="logo">
        <h1>🎓 SkillCerts</h1>
      </div>

      <div class="certificate-title">
        <h2>Certificate</h2>
        <div class="certificate-subtitle">of Completion</div>
      </div>

      <div class="divider"></div>

      <p class="awarded-to">This certificate is proudly presented to</p>

      <h3 class="recipient-name">${userName}</h3>

      <p class="completion-text">
        for successfully completing the online course
      </p>

      <div class="course-name">${courseTitle}</div>

      <div class="certificate-footer">
        <div class="date-section">
          <div class="label">Date of Completion</div>
          <div class="value">${completionDate}</div>
        </div>

        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="value">${instructorName}</div>
          <div class="label">Course Instructor</div>
        </div>
      </div>

      <div class="certificate-id">
        <div class="certificate-id-label">Certificate ID</div>
        <div class="certificate-id-value">${certificateId}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
