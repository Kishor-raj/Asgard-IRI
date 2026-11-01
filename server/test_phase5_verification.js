/**
 * test_phase5_verification.js
 * End-to-end automated verification script for ASGARD-IRI Phase 5.
 */

require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const pool = require('./src/config/db');

let server;
let baseUrl;
let adminCookie = '';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (options.cookie) {
      reqOptions.headers['Cookie'] = options.cookie;
    }

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          raw: body,
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      if (typeof options.body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(options.body));
      } else {
        req.write(options.body);
      }
    }

    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('  ASGARD-IRI Phase 5 Verification Suite');
  console.log('======================================================\n');

  try {
    // 1. Authenticate Admin User
    console.log('1. Authenticating Admin User...');
    const loginRes = await request('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@asgard-iri.org',
        password: 'SecurePass123!',
      },
    });

    if (loginRes.status !== 200 || !loginRes.headers['set-cookie']) {
      throw new Error(`Admin login failed: ${loginRes.raw}`);
    }

    adminCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log('   - Admin session established successfully.\n');

    // 2. Prepare conference & registration record
    console.log('2. Setting up Conference & Academy Registrations...');
    // Ensure at least 1 conference exists
    let confRes = await pool.query("SELECT id, title FROM conferences LIMIT 1");
    let confId, confTitle;
    if (confRes.rows.length === 0) {
      const newConf = await pool.query(`
        INSERT INTO conferences (title, slug, theme, status)
        VALUES ('Global Quantum Computing Summit 2026', 'gqcs-2026', 'Quantum Horizons', 'upcoming')
        RETURNING id, title
      `);
      confId = newConf.rows[0].id;
      confTitle = newConf.rows[0].title;
    } else {
      confId = confRes.rows[0].id;
      confTitle = confRes.rows[0].title;
    }

    // Insert conference registration
    const regRes = await pool.query(
      `INSERT INTO conference_registrations
         (conference_id, name, email, affiliation, designation, mode_preference, payment_status)
       VALUES ($1, 'Dr. Marcus Vance', 'marcus.vance@cambridge.edu', 'Cambridge Lab', 'Principal Fellow', 'hybrid', 'pending')
       RETURNING id`,
      [confId]
    );
    const confRegId = regRes.rows[0].id;

    // Ensure academy program exists
    let progRes = await pool.query("SELECT id, title FROM academy_programs LIMIT 1");
    let progId;
    if (progRes.rows.length === 0) {
      const newProg = await pool.query(`
        INSERT INTO academy_programs (type, title, slug, duration, mode, is_active)
        VALUES ('fdp', 'Frontier AI & Quantum Algorithms Masterclass', 'frontier-ai-quantum', '4 Weeks', 'Online', true)
        RETURNING id
      `);
      progId = newProg.rows[0].id;
    } else {
      progId = progRes.rows[0].id;
    }

    const acadRegRes = await pool.query(
      `INSERT INTO academy_registrations
         (program_id, name, email, affiliation, designation, status, payment_status)
       VALUES ($1, 'Priya Soundararajan', 'priya.s@iitm.ac.in', 'IIT Madras', 'Assistant Professor', 'applied', 'pending')
       RETURNING id`,
      [progId]
    );
    const acadRegId = acadRegRes.rows[0].id;
    console.log(`   - Created Conference Registration #${confRegId} and Academy Registration #${acadRegId}.\n`);

    // 3. Testing Razorpay Payment Order Creation
    console.log('3. Testing Razorpay Payment Order Creation (POST /payments/create-order)...');
    const orderRes = await request('/api/v1/payments/create-order', {
      method: 'POST',
      body: {
        amount: 2500,
        currency: 'INR',
        entityType: 'conference_registration',
        entityId: confRegId,
      },
    });

    if (orderRes.status !== 201 || !orderRes.data?.data?.orderId) {
      throw new Error(`Order creation failed (status ${orderRes.status}): ${orderRes.raw}`);
    }

    const { orderId, keyId } = orderRes.data.data;
    console.log(`   - Status 201: Created Order ID: ${orderId} (Key ID: ${keyId})`);

    // Verify database record
    const dbOrder = await pool.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    if (dbOrder.rows.length === 0 || dbOrder.rows[0].status !== 'created') {
      throw new Error(`Payment record not found in DB with status 'created'.`);
    }
    console.log('   - Database verification: Pending payment row recorded.\n');

    // 4. Testing Payment Signature Verification & Auto-Certificate Issuance
    console.log('4. Testing Payment Verification & Automated Certificate Generation...');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_asgard_iri_secret_key_987654321';
    const mockPaymentId = `pay_rzp_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${mockPaymentId}`)
      .digest('hex');

    const verifyRes = await request('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: validSignature,
        entityType: 'conference_registration',
        entityId: confRegId,
      },
    });

    if (verifyRes.status !== 200 || !verifyRes.data?.success) {
      throw new Error(`Payment verification failed: ${verifyRes.raw}`);
    }

    const verifyData = verifyRes.data.data;
    console.log(`   - Status 200: Payment verified! Payment ID: ${verifyData.paymentId}`);

    // Check certificate generation
    const issuedCert = verifyData.certificate;
    if (!issuedCert || !issuedCert.certificate_uid || !issuedCert.pdf_url) {
      throw new Error(`Automated certificate was not generated or returned in verification.`);
    }
    console.log(`   - Auto-Generated Certificate: UID = ${issuedCert.certificate_uid}`);
    console.log(`   - PDF URL: ${issuedCert.pdf_url}`);

    // Verify PDF file exists on filesystem
    const diskPath = path.join(__dirname, '..', issuedCert.pdf_url);
    if (!fs.existsSync(diskPath)) {
      throw new Error(`Certificate PDF file missing on filesystem at: ${diskPath}`);
    }
    const pdfStat = fs.statSync(diskPath);
    console.log(`   - Filesystem verification: PDF file exists (${pdfStat.size} bytes).`);

    // Verify conference_registration payment_status updated
    const regCheck = await pool.query(
      'SELECT payment_status FROM conference_registrations WHERE id = $1',
      [confRegId]
    );
    if (regCheck.rows[0]?.payment_status !== 'paid') {
      throw new Error(`conference_registrations payment_status is not 'paid'`);
    }
    console.log("   - Database verification: conference_registrations.payment_status is 'paid'.\n");

    // 5. Testing Academy Payment & Auto Certificate
    console.log('5. Testing Academy Payment & Auto Certificate Generation...');
    const acadOrderRes = await request('/api/v1/payments/create-order', {
      method: 'POST',
      body: {
        amount: 3500,
        currency: 'INR',
        entityType: 'academy_registration',
        entityId: acadRegId,
      },
    });
    const acadOrderId = acadOrderRes.data.data.orderId;
    const acadPaymentId = `pay_acad_${Date.now()}`;
    const acadSig = crypto
      .createHmac('sha256', secret)
      .update(`${acadOrderId}|${acadPaymentId}`)
      .digest('hex');

    const acadVerifyRes = await request('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: acadOrderId,
        razorpay_payment_id: acadPaymentId,
        razorpay_signature: acadSig,
        entityType: 'academy_registration',
        entityId: acadRegId,
      },
    });

    if (acadVerifyRes.status !== 200 || !acadVerifyRes.data?.data?.certificate) {
      throw new Error(`Academy payment verification failed: ${acadVerifyRes.raw}`);
    }
    const acadCert = acadVerifyRes.data.data.certificate;
    console.log(`   - Status 200: Academy enrollment confirmed, cert UID: ${acadCert.certificate_uid}.\n`);

    // 6. Testing Public Certificate Verification Endpoint (GET /certificates/verify/:uid)
    console.log('6. Testing Public Certificate Verification (GET /certificates/verify/:uid)...');
    const certVerifyRes = await request(`/api/v1/certificates/verify/${issuedCert.certificate_uid}`);
    if (certVerifyRes.status !== 200 || !certVerifyRes.data?.success) {
      throw new Error(`Public verification failed: ${certVerifyRes.raw}`);
    }
    const verifiedRecord = certVerifyRes.data.data;
    console.log(`   - Status 200: Verified Authentic Credential:`);
    console.log(`     * Recipient: ${verifiedRecord.recipient_name}`);
    console.log(`     * Program: ${verifiedRecord.issued_for_label}`);
    console.log(`     * Category: ${verifiedRecord.credential_category}`);
    console.log(`     * PDF Download: ${verifiedRecord.pdf_url}`);

    // Invalid UID test
    const fakeRes = await request('/api/v1/certificates/verify/00000000-0000-0000-0000-000000000000');
    if (fakeRes.status !== 404) {
      throw new Error(`Expected 404 for non-existent UID, got ${fakeRes.status}`);
    }
    console.log('   - Security verification: 404 returned for invalid UID.\n');

    // 7. Testing Admin Analytics & Payments Console
    console.log('7. Testing Admin Analytics (GET /admin/analytics)...');
    const analyticsRes = await request('/api/v1/admin/analytics', {
      cookie: adminCookie,
    });
    if (analyticsRes.status !== 200 || !analyticsRes.data?.data) {
      throw new Error(`Admin analytics endpoint failed: ${analyticsRes.raw}`);
    }
    const analytics = analyticsRes.data.data;
    console.log(`   - Status 200: Analytics Loaded:`);
    console.log(`     * Total Revenue: ₹${analytics.metrics?.totalRevenue}`);
    console.log(`     * Paid Transactions: ${analytics.metrics?.paidTransactions}`);
    console.log(`     * Active Partners: ${analytics.metrics?.activePartnersCount}`);
    console.log(`     * Top Pages Tracked: ${analytics.topPages?.length}`);

    // Admin payments list & refund
    console.log('   - Testing Admin Payments List (GET /admin/payments)...');
    const adminPaymentsRes = await request('/api/v1/admin/payments', {
      cookie: adminCookie,
    });
    if (adminPaymentsRes.status !== 200 || !adminPaymentsRes.data?.data) {
      throw new Error(`Admin payments list failed: ${adminPaymentsRes.raw}`);
    }
    const targetPayment = adminPaymentsRes.data.data.find(p => p.order_id === orderId);
    if (!targetPayment) {
      throw new Error(`Payment ${orderId} not found in admin payment list.`);
    }

    console.log(`   - Testing Admin Refund (POST /admin/payments/${targetPayment.id}/refund)...`);
    const refundRes = await request(`/api/v1/admin/payments/${targetPayment.id}/refund`, {
      method: 'POST',
      cookie: adminCookie,
      body: { reason: 'Automated test suite refund' },
    });
    if (refundRes.status !== 200 || refundRes.data?.data?.status !== 'refunded') {
      throw new Error(`Refund failed: ${refundRes.raw}`);
    }
    console.log("   - Status 200: Payment marked as refunded.\n");

    // 8. Testing Institutional Partners & Partner Portal
    console.log('8. Testing Institutional Partners & Portal...');
    const partnersRes = await request('/api/v1/partners');
    if (partnersRes.status !== 200 || !Array.isArray(partnersRes.data?.data)) {
      throw new Error(`Public partners endpoint failed: ${partnersRes.raw}`);
    }
    console.log(`   - Status 200: Public partners list fetched (${partnersRes.data.data.length} partners).`);

    const portalRes = await request('/api/v1/partners/portal');
    if (portalRes.status !== 200 || !portalRes.data?.data?.jointPublications) {
      throw new Error(`Partner portal endpoint failed: ${portalRes.raw}`);
    }
    console.log(`   - Status 200: Partner portal collaborative initiatives verified.`);

    // Admin Partner CRUD
    const createPartnerRes = await request('/api/v1/admin/partners', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        organisation_name: 'Geneva Bioengineering Consortium',
        website_url: 'https://example.org/geneva',
        collaboration_type: 'research',
        is_active: true,
      },
    });
    if (createPartnerRes.status !== 201) {
      throw new Error(`Admin create partner failed: ${createPartnerRes.raw}`);
    }
    const createdPartnerId = createPartnerRes.data.data.id;
    console.log(`   - Status 201: Partner #${createdPartnerId} created.`);

    const deletePartnerRes = await request(`/api/v1/admin/partners/${createdPartnerId}`, {
      method: 'DELETE',
      cookie: adminCookie,
    });
    if (deletePartnerRes.status !== 200) {
      throw new Error(`Admin delete partner failed: ${deletePartnerRes.raw}`);
    }
    console.log(`   - Status 200: Partner #${createdPartnerId} deleted.\n`);

    // 9. Verifying Audit Logs
    console.log('9. Verifying Audit Logs for Phase 5...');
    const auditRes = await request('/api/v1/admin/audit-logs', {
      cookie: adminCookie,
    });
    if (auditRes.status === 200 && auditRes.data?.data) {
      const actions = auditRes.data.data.map(l => l.action);
      console.log(`   - Status 200: Recent audit actions: ${actions.slice(0, 5).join(', ')}`);
    }

    console.log('\n======================================================');
    console.log('  ALL PHASE 5 TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 5 TEST SUITE FAILED:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await pool.end();
    process.exit(0);
  }
}

// Start HTTP server on dynamic port
server = http.createServer(app);
server.listen(0, () => {
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  runTests();
});
