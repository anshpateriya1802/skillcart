import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate certificate PDF stream (on-demand, no file storage)
 */
export const generateCertificatePDF = (data, responseStream) => {
  const {
    userName,
    courseTitle,
    completionDate,
    certificateId,
    instructorName,
  } = data;

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 50,
  });

  doc.pipe(responseStream);

  // Certificate border
  doc
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(3)
    .stroke('#1E40AF');

  doc
    .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .lineWidth(1)
    .stroke('#60A5FA');

  // Title
  doc
    .fontSize(48)
    .font('Helvetica-Bold')
    .fillColor('#1E40AF')
    .text('CERTIFICATE', 0, 80, { align: 'center' });

  doc
    .fontSize(24)
    .font('Helvetica')
    .fillColor('#4B5563')
    .text('OF COMPLETION', 0, 140, { align: 'center' });

  // Divider line
  doc
    .moveTo(200, 180)
    .lineTo(doc.page.width - 200, 180)
    .lineWidth(2)
    .stroke('#D1D5DB');

  // This certifies that
  doc
    .fontSize(16)
    .font('Helvetica')
    .fillColor('#6B7280')
    .text('This is to certify that', 0, 220, { align: 'center' });

  // Student name
  doc
    .fontSize(36)
    .font('Helvetica-Bold')
    .fillColor('#111827')
    .text(userName, 0, 260, { align: 'center' });

  // Has successfully completed
  doc
    .fontSize(16)
    .font('Helvetica')
    .fillColor('#6B7280')
    .text('has successfully completed the course', 0, 320, {
      align: 'center',
    });

  // Course title
  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor('#1E40AF')
    .text(courseTitle, 0, 360, { align: 'center', width: doc.page.width });

  // Date and instructor section
  const bottomY = doc.page.height - 180;

  // Date
  doc
    .fontSize(14)
    .font('Helvetica')
    .fillColor('#4B5563')
    .text(`Date: ${completionDate}`, 100, bottomY, { align: 'left' });

  // Instructor signature line
  if (instructorName) {
    doc
      .moveTo(doc.page.width - 300, bottomY - 10)
      .lineTo(doc.page.width - 100, bottomY - 10)
      .stroke('#9CA3AF');

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(instructorName, doc.page.width - 300, bottomY, {
        width: 200,
        align: 'center',
      });

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text('Instructor', doc.page.width - 300, bottomY + 20, {
        width: 200,
        align: 'center',
      });
  }

  // Certificate ID at bottom
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#9CA3AF')
    .text(`Certificate ID: ${certificateId}`, 0, doc.page.height - 60, {
      align: 'center',
    });

  // SkillCerts branding
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1E40AF')
    .text('SkillCerts', 0, doc.page.height - 40, { align: 'center' });

  doc.end();
};

/**
 * Generate unique certificate ID
 */
export const generateCertificateId = () => {
  const uuid = uuidv4().replace(/-/g, '').toUpperCase();
  return `SC-${uuid.substring(0, 12)}`;
};
