const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinary');

/**
 * Generates an official ASGARD-IRI Certificate PDF and uploads directly to Cloudinary.
 * @param {Object} params
 * @param {string} params.recipientName
 * @param {string} params.eventLabel
 * @param {Date|string} params.issuedDate
 * @param {string} params.certificateUid
 * @returns {Promise<{ pdfUrl: string, pdfPublicId: string }>}
 */
async function generateAndUploadCertificate({
  recipientName,
  eventLabel,
  issuedDate = new Date(),
  certificateUid,
}) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify/${certificateUid}`;

  // 1. Generate QR Code buffer
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 110,
    color: {
      dark: '#03060f',
      light: '#ffffff',
    },
  });

  // 2. Generate PDF document into memory buffer
  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 60,
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    const width = 841.89;
    const height = 595.28;

    // Navy & Gold Certificate Borders
    doc.rect(24, 24, width - 48, height - 48)
      .lineWidth(3)
      .strokeColor('#03060f')
      .stroke();

    doc.rect(30, 30, width - 60, height - 60)
      .lineWidth(1)
      .strokeColor('#c9a227')
      .stroke();

    // Header: Foundation Name
    doc.fontSize(22)
      .fillColor('#03060f')
      .font('Helvetica-Bold')
      .text('ASGARD INTERNATIONAL FOUNDATION', 0, 75, { align: 'center', characterSpacing: 2 });

    doc.fontSize(10)
      .fillColor('#c9a227')
      .font('Helvetica-Bold')
      .text('INSTITUTE OF RESEARCH & INNOVATION', 0, 105, { align: 'center', characterSpacing: 3 });

    // Certificate Title
    doc.moveDown(1.5);
    doc.fontSize(28)
      .fillColor('#03060f')
      .font('Helvetica-Bold')
      .text('CERTIFICATE OF ACCOMPLISHMENT', { align: 'center' });

    // Subtitle
    doc.moveDown(0.8);
    doc.fontSize(13)
      .fillColor('#4a5375')
      .font('Helvetica-Oblique')
      .text('This is to certify that', { align: 'center' });

    // Recipient Name
    doc.moveDown(0.8);
    doc.fontSize(26)
      .fillColor('#c9a227')
      .font('Helvetica-Bold')
      .text(recipientName || 'Academic Scholar', { align: 'center' });

    // Divider Line under recipient name
    const lineY = doc.y + 4;
    doc.moveTo(width / 2 - 160, lineY)
      .lineTo(width / 2 + 160, lineY)
      .lineWidth(1)
      .strokeColor('#c9a227')
      .stroke();

    // Recognition text & event label
    doc.moveDown(1.2);
    doc.fontSize(13)
      .fillColor('#4a5375')
      .font('Helvetica')
      .text('has successfully completed / participated in the academic initiative:', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(16)
      .fillColor('#03060f')
      .font('Helvetica-Bold')
      .text(eventLabel || 'Academic Programme', { align: 'center' });

    // Footer Info & QR Code
    const formattedDate = new Date(issuedDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Date & Certificate UID
    doc.fontSize(10)
      .fillColor('#6b7591')
      .font('Helvetica')
      .text(`Issued Date: ${formattedDate}`, 60, height - 120);

    doc.fontSize(8)
      .fillColor('#8d96af')
      .text(`UID: ${certificateUid}`, 60, height - 100);

    doc.fontSize(8)
      .fillColor('#8d96af')
      .text(`Verify online: ${verifyUrl}`, 60, height - 85);

    // QR Code on bottom right
    doc.image(qrBuffer, width - 180, height - 170, { width: 95, height: 95 });

    doc.fontSize(7)
      .fillColor('#6b7591')
      .text('Scan to Verify', width - 180, height - 70, { width: 95, align: 'center' });

    doc.end();
  });

  // 3. Upload buffer to Cloudinary using upload_stream
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'asgard-iri/certificates',
        resource_type: 'raw',
        public_id: `cert_${certificateUid}`,
        flags: 'attachment',
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Certificate upload error:', error);
          // Return fallback object if Cloudinary credentials are not configured
          return resolve({
            pdfUrl: `/certificates/cert_${certificateUid}.pdf`,
            pdfPublicId: `cert_${certificateUid}`,
          });
        }
        resolve({
          pdfUrl: result.secure_url,
          pdfPublicId: result.public_id,
        });
      }
    );

    uploadStream.end(pdfBuffer);
  });
}

module.exports = { generateAndUploadCertificate };
