const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../config/db');

/**
 * Generates an official ASGARD-IRI Certificate PDF with embedded QR code.
 */
async function generateCertificatePdf({
  recipientName,
  issuedForType,
  issuedForLabel,
  issuedDate = new Date(),
  certificateUid = crypto.randomUUID(),
}) {
  const uploadDir = path.join(__dirname, '../../../uploads/certificates');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `cert-${certificateUid}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  const pdfUrl = `/uploads/certificates/${fileName}`;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify?uid=${certificateUid}`;

  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 120,
    color: {
      dark: '#0B1F4B',
      light: '#FFFFFF',
    },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const width = 841.89;
    const height = 595.28;

    // Outer Navy Border
    doc.rect(20, 20, width - 40, height - 40)
      .lineWidth(3)
      .strokeColor('#0B1F4B')
      .stroke();

    // Inner Gold Border
    doc.rect(26, 26, width - 52, height - 52)
      .lineWidth(1)
      .strokeColor('#D4AF37')
      .stroke();

    // Corner decorative accents
    const cornerSize = 16;
    doc.lineWidth(1.5).strokeColor('#D4AF37');
    doc.moveTo(32, 32 + cornerSize).lineTo(32, 32).lineTo(32 + cornerSize, 32).stroke();
    doc.moveTo(width - 32 - cornerSize, 32).lineTo(width - 32, 32).lineTo(width - 32, 32 + cornerSize).stroke();
    doc.moveTo(32, height - 32 - cornerSize).lineTo(32, height - 32).lineTo(32 + cornerSize, height - 32).stroke();
    doc.moveTo(width - 32 - cornerSize, height - 32).lineTo(width - 32, height - 32).lineTo(width - 32, height - 32 - cornerSize).stroke();

    // Header: Institution Title
    doc.moveDown(1.2);
    doc.font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#0B1F4B')
      .text('ASGARD INSTITUTE OF RESEARCH & INNOVATION', { align: 'center', characterSpacing: 1.2 });

    doc.font('Helvetica')
      .fontSize(9.5)
      .fillColor('#718096')
      .text('Autonomous International Research, Academic & Technology Institution', { align: 'center' });

    doc.moveDown(0.9);
    doc.font('Helvetica-Bold')
      .fontSize(15)
      .fillColor('#D4AF37')
      .text('OFFICIAL CREDENTIAL CERTIFICATE', { align: 'center', characterSpacing: 2 });

    doc.moveDown(0.8);
    doc.font('Helvetica-Oblique')
      .fontSize(12)
      .fillColor('#4A5568')
      .text('This is to officially certify that', { align: 'center' });

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold')
      .fontSize(23)
      .fillColor('#0B1F4B')
      .text(recipientName || 'Participant Scholar', { align: 'center' });

    doc.moveDown(0.5);
    doc.font('Helvetica')
      .fontSize(11.5)
      .fillColor('#4A5568')
      .text('has successfully completed and fulfilled all official requirements for:', { align: 'center' });

    doc.moveDown(0.4);
    doc.font('Helvetica-Bold')
      .fontSize(15)
      .fillColor('#0B1F4B')
      .text(issuedForLabel || 'Academic & Innovation Program', { align: 'center' });

    doc.moveDown(0.4);
    const formattedDate = new Date(issuedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.font('Helvetica')
      .fontSize(9.5)
      .fillColor('#718096')
      .text(`Category: ${(issuedForType || 'ACADEMIC').toUpperCase()}   |   Date of Issuance: ${formattedDate}`, { align: 'center' });

    // Embedded QR Code (bottom left)
    doc.image(qrBuffer, 65, height - 165, { width: 90, height: 90 });
    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#718096')
      .text('Scan to verify credential', 60, height - 70, { width: 100, align: 'center' });

    // Signatories (bottom right)
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#0B1F4B')
      .text('Prof. E. R. Sterling, Ph.D.', 460, height - 120, { align: 'center', width: 150 });
    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#718096')
      .text('Director of Research & Innovation\nASGARD-IRI', 460, height - 105, { align: 'center', width: 150 });
    doc.moveTo(460, height - 125).lineTo(610, height - 125).lineWidth(0.5).strokeColor('#CBD5E0').stroke();

    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#0B1F4B')
      .text('Dr. Sarah Chen, F.R.S.', 640, height - 120, { align: 'center', width: 150 });
    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#718096')
      .text('Dean of Academic Affairs\nASGARD-IRI', 640, height - 105, { align: 'center', width: 150 });
    doc.moveTo(640, height - 125).lineTo(790, height - 125).lineWidth(0.5).strokeColor('#CBD5E0').stroke();

    // Unique Cryptographic UID on Footer
    doc.font('Courier')
      .fontSize(8)
      .fillColor('#A0AEC0')
      .text(`CREDENTIAL UID: ${certificateUid}`, 180, height - 50, { align: 'center', width: 480 });

    doc.end();

    writeStream.on('finish', () => {
      resolve({
        certificateUid,
        pdfUrl,
        filePath,
      });
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * High-level service: Generates PDF and persists/updates certificate record in PostgreSQL.
 */
async function issueCertificateRecord({
  userId,
  recipientName,
  issuedForType,
  issuedForId,
  issuedForLabel,
  issuedDate = new Date(),
}) {
  const certificateUid = crypto.randomUUID();
  const pdfResult = await generateCertificatePdf({
    recipientName,
    issuedForType,
    issuedForLabel,
    issuedDate,
    certificateUid,
  });

  const { rows } = await pool.query(
    `INSERT INTO certificates
       (user_id, issued_for_type, issued_for_id, issued_for_label, certificate_uid, pdf_url, issued_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'issued')
     RETURNING *`,
    [
      userId || null,
      issuedForType,
      issuedForId || null,
      issuedForLabel,
      certificateUid,
      pdfResult.pdfUrl,
      issuedDate,
    ]
  );

  return rows[0];
}

module.exports = {
  generateCertificatePdf,
  issueCertificateRecord,
};
