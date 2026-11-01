const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./src/app');

// Start temporary test server
const server = http.createServer(app);

async function runTests() {
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api/v1';
  console.log('Testing against:', baseUrl);

  let adminCookie = '';
  let userCookie = '';
  let testUserId = null;
  let testConferenceId = null;
  let testProgramId = null;
  let testSubmissionId = null;
  let testCertUid = null;

  function extractCookie(res) {
    const raw = res.headers.get('set-cookie');
    if (!raw) return '';
    return raw.split(';')[0];
  }

  try {
    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@asgard-iri.org', password: 'SecurePass123!' }),
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.success) throw new Error('Admin login failed: ' + JSON.stringify(adminData));
    adminCookie = extractCookie(adminLoginRes);
    console.log('✔ Admin logged in successfully.');

    // 2. User Registration, Admin Approval, and User Login
    console.log('2. Testing User Registration, Admin Approval, and User Login...');
    const userRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'scholar_phase2@test.edu',
        password: 'Scholar@12345',
        fullName: 'Dr. Alan Turing',
        role: 'researcher',
      }),
    });
    const userRegData = await userRegRes.json();
    if (userRegData.success) {
      testUserId = userRegData.data.id;
    } else {
      // Find existing user id
      const pool = require('./src/config/db');
      const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', ['scholar_phase2@test.edu']);
      testUserId = rows[0]?.id;
    }

    // Admin approves user
    const approveRes = await fetch(`${baseUrl}/admin/users/${testUserId}/approve`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
    });
    const approveData = await approveRes.json();
    console.log('✔ Admin approved participant user. Status:', approveData.data?.status || 'active');

    // Participant logs in
    const userLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'scholar_phase2@test.edu', password: 'Scholar@12345' }),
    });
    const userLoginData = await userLoginRes.json();
    if (!userLoginData.success) throw new Error('User login failed: ' + JSON.stringify(userLoginData));
    userCookie = extractCookie(userLoginRes);
    console.log('✔ Participant user logged in with session cookie. ID:', testUserId);

    // 3. Admin creates a Conference
    console.log('3. Admin creates a test Conference...');
    const confCreateRes = await fetch(`${baseUrl}/admin/conferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: 'Phase 2 International Symposium on Quantum Information',
        theme: 'Frontiers of Fault-Tolerant Quantum Architectures',
        status: 'upcoming',
        startDate: '2027-01-15',
        endDate: '2027-01-18',
        venue: 'International Convention Centre, Singapore',
        mode: 'hybrid',
        description: 'Global symposium on quantum networking and superconducting circuits.',
      }),
    });
    const confData = await confCreateRes.json();
    if (!confData.success) throw new Error('Conference creation failed: ' + JSON.stringify(confData));
    testConferenceId = confData.data.id;
    console.log('✔ Conference created. ID:', testConferenceId);

    // 4. Participant Submits Paper with PDF upload
    console.log('4. Participant submits research paper with PDF...');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF';
    
    // Build multipart/form-data payload
    let multipartBody = '';
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="title"\r\n\r\n`;
    multipartBody += `Scalable Quantum Error Correction via Surface Codes\r\n`;

    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="abstract"\r\n\r\n`;
    multipartBody += `We present a fault-tolerant threshold theorem for asymmetric topological memory.\r\n`;

    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="submissionType"\r\n\r\n`;
    multipartBody += `paper\r\n`;

    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="authorsText"\r\n\r\n`;
    multipartBody += `Dr. Alan Turing, Dr. Claude Shannon\r\n`;

    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="keywords"\r\n\r\n`;
    multipartBody += `Quantum, Surface Codes, Topology\r\n`;

    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="file"; filename="quantum_paper.pdf"\r\n`;
    multipartBody += `Content-Type: application/pdf\r\n\r\n`;
    multipartBody += `${dummyPdfContent}\r\n`;
    multipartBody += `--${boundary}--\r\n`;

    const subRes = await fetch(`${baseUrl}/conferences/${testConferenceId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Cookie: userCookie,
      },
      body: multipartBody,
    });
    const subData = await subRes.json();
    if (!subData.success) throw new Error('Paper submission failed: ' + JSON.stringify(subData));
    testSubmissionId = subData.data.id;
    console.log('✔ Paper submitted. Submission ID:', testSubmissionId, 'File URL:', subData.data.file_url);

    // 5. Participant checks My Conference Submissions
    console.log('5. Checking My Conference Submissions...');
    const mySubRes = await fetch(`${baseUrl}/my/conference-submissions`, {
      headers: { Cookie: userCookie },
    });
    const mySubData = await mySubRes.json();
    if (!mySubData.success || mySubData.data.length === 0) {
      throw new Error('Failed to retrieve user conference submissions: ' + JSON.stringify(mySubData));
    }
    console.log('✔ User has', mySubData.data.length, 'submitted papers in dashboard.');

    // 6. Admin checks Conference Submissions & Updates Status to Accepted
    console.log('6. Admin reviews paper and marks Accepted with reviewer feedback...');
    const adminSubsRes = await fetch(`${baseUrl}/admin/conferences/${testConferenceId}/submissions`, {
      headers: { Cookie: adminCookie },
    });
    const adminSubsData = await adminSubsRes.json();
    if (!adminSubsData.success || adminSubsData.data.length === 0) {
      throw new Error('Admin failed to get submissions: ' + JSON.stringify(adminSubsData));
    }

    // In our routes PATCH /admin/submissions/:id/status is defined.
    const reviewPatchRes = await fetch(`${baseUrl}/admin/submissions/${testSubmissionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        status: 'accepted',
        reviewerNotes: 'Outstanding manuscript. Accepted for oral presentation in Track A.',
      }),
    });
    const reviewData = await reviewPatchRes.json();
    if (!reviewData.success || reviewData.data.status !== 'accepted') {
      throw new Error('Admin review status update failed: ' + JSON.stringify(reviewData));
    }
    console.log('✔ Paper review decision recorded: status is ACCEPTED.');

    // 7. Conference Registration with Dummy Payment
    console.log('7. Testing Conference Registration with Dummy Payment...');
    const regRes = await fetch(`${baseUrl}/conferences/${testConferenceId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userCookie },
      body: JSON.stringify({
        name: 'Dr. Alan Turing',
        email: 'scholar_phase2@test.edu',
        affiliation: 'Cambridge Computing Laboratory',
        designation: 'Fellow & Professor',
        modePreference: 'hybrid',
      }),
    });
    const regData = await regRes.json();
    if (!regData.success) throw new Error('Conference registration failed: ' + JSON.stringify(regData));
    console.log('✔ Conference registration confirmed. ID:', regData.data.id);

    // 8. User checks My Conference Registrations
    console.log('8. Checking My Conference Registrations...');
    const myRegRes = await fetch(`${baseUrl}/my/conference-registrations`, {
      headers: { Cookie: userCookie },
    });
    const myRegData = await myRegRes.json();
    if (!myRegData.success || myRegData.data.length === 0) {
      throw new Error('Failed to retrieve user conference registrations.');
    }
    console.log('✔ User dashboard lists', myRegData.data.length, 'registered conferences.');

    // 9. Admin Exports Conference Registrations CSV
    console.log('9. Testing Admin Conference Registrations CSV export...');
    const csvConfRes = await fetch(`${baseUrl}/admin/conferences/${testConferenceId}/registrations/export`, {
      headers: { Cookie: adminCookie },
    });
    const csvConfText = await csvConfRes.text();
    if (!csvConfText.includes('Registration ID') || !csvConfText.includes('scholar_phase2@test.edu')) {
      throw new Error('Invalid CSV export content: ' + csvConfText);
    }
    console.log('✔ Conference registrations CSV exported successfully.');

    // 10. Admin creates an Academy Programme
    console.log('10. Admin creates an Academy Programme...');
    const progCreateRes = await fetch(`${baseUrl}/admin/academy/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: 'Executive FDP: Deep Reinforcement Learning for Physical Systems',
        type: 'fdp',
        description: 'Comprehensive faculty development module covering policy gradients, model-based RL, and robotics simulators.',
        duration: '6 Weeks',
        mode: 'online',
        startDate: '2027-02-01',
        seats: 25,
        isActive: true,
      }),
    });
    const progData = await progCreateRes.json();
    if (!progData.success) throw new Error('Academy programme creation failed: ' + JSON.stringify(progData));
    testProgramId = progData.data.id;
    console.log('✔ Academy programme created. ID:', testProgramId);

    // 11. User registers for Academy Programme
    console.log('11. Testing Academy Programme Registration...');
    const acadRegRes = await fetch(`${baseUrl}/academy/programs/${testProgramId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userCookie },
      body: JSON.stringify({
        name: 'Dr. Alan Turing',
        email: 'scholar_phase2@test.edu',
        affiliation: 'Cambridge Computing Laboratory',
        designation: 'Fellow & Professor',
      }),
    });
    const acadRegData = await acadRegRes.json();
    if (!acadRegData.success) throw new Error('Academy registration failed: ' + JSON.stringify(acadRegData));
    const testAcadRegId = acadRegData.data.id;
    console.log('✔ Academy registration completed. ID:', testAcadRegId);

    // 12. User checks My Academy Registrations
    console.log('12. Checking My Academy Registrations...');
    const myAcadRes = await fetch(`${baseUrl}/my/academy-registrations`, {
      headers: { Cookie: userCookie },
    });
    const myAcadData = await myAcadRes.json();
    if (!myAcadData.success || myAcadData.data.length === 0) {
      throw new Error('Failed to retrieve user academy registrations.');
    }
    console.log('✔ User dashboard lists', myAcadData.data.length, 'enrolled academy programmes.');

    // 13. Admin updates Academy Enrollment status & Exports CSV
    console.log('13. Admin updates Academy Registration status and exports CSV...');
    const acadStatusPatch = await fetch(`${baseUrl}/admin/academy/registrations/${testAcadRegId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    const acadStatusData = await acadStatusPatch.json();
    if (!acadStatusData.success || acadStatusData.data.status !== 'confirmed') {
      throw new Error('Academy registration status update failed: ' + JSON.stringify(acadStatusData));
    }

    const acadCsvRes = await fetch(`${baseUrl}/admin/academy/registrations/export`, {
      headers: { Cookie: adminCookie },
    });
    const acadCsvText = await acadCsvRes.text();
    if (!acadCsvText.includes('Registration ID') || !acadCsvText.includes('scholar_phase2@test.edu')) {
      throw new Error('Invalid Academy CSV export content.');
    }
    console.log('✔ Academy enrollment confirmed and CSV export verified.');

    // 14. Admin issues a Certificate with PDF upload
    console.log('14. Admin issues a verifiable Certificate with PDF upload...');
    const certBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let certBody = '';
    certBody += `--${certBoundary}\r\n`;
    certBody += `Content-Disposition: form-data; name="userId"\r\n\r\n`;
    certBody += `${testUserId}\r\n`;

    certBody += `--${certBoundary}\r\n`;
    certBody += `Content-Disposition: form-data; name="issuedForType"\r\n\r\n`;
    certBody += `conference\r\n`;

    certBody += `--${certBoundary}\r\n`;
    certBody += `Content-Disposition: form-data; name="issuedForLabel"\r\n\r\n`;
    certBody += `Phase 2 International Symposium on Quantum Information - Best Paper Award\r\n`;

    certBody += `--${certBoundary}\r\n`;
    certBody += `Content-Disposition: form-data; name="issuedDate"\r\n\r\n`;
    certBody += `2027-01-18\r\n`;

    certBody += `--${certBoundary}\r\n`;
    certBody += `Content-Disposition: form-data; name="pdf"; filename="certificate.pdf"\r\n`;
    certBody += `Content-Type: application/pdf\r\n\r\n`;
    certBody += `${dummyPdfContent}\r\n`;
    certBody += `--${certBoundary}--\r\n`;

    const certRes = await fetch(`${baseUrl}/admin/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${certBoundary}`,
        Cookie: adminCookie,
      },
      body: certBody,
    });
    const certResData = await certRes.json();
    if (!certResData.success) throw new Error('Certificate issuance failed: ' + JSON.stringify(certResData));
    testCertUid = certResData.data.certificate_uid;
    console.log('✔ Certificate issued. UID:', testCertUid, 'PDF URL:', certResData.data.pdf_url);

    // 15. User checks My Certificates
    console.log('15. Checking My Certificates in dashboard...');
    const myCertsRes = await fetch(`${baseUrl}/my/certificates`, {
      headers: { Cookie: userCookie },
    });
    const myCertsData = await myCertsRes.json();
    if (!myCertsData.success || myCertsData.data.length === 0) {
      throw new Error('Failed to retrieve user certificates: ' + JSON.stringify(myCertsData));
    }
    console.log('✔ User has', myCertsData.data.length, 'verifiable certificates in dashboard.');

    // 16. Public verification endpoint test
    console.log('16. Testing Public Certificate Verification (/certificates/verify/:uid)...');
    const verifyRes = await fetch(`${baseUrl}/certificates/verify/${testCertUid}`);
    const verifyData = await verifyRes.json();
    if (!verifyData.success || verifyData.data.certificate_uid !== testCertUid) {
      throw new Error('Public verification lookup failed: ' + JSON.stringify(verifyData));
    }
    console.log('✔ Public verification lookup passed for UID:', testCertUid);
    console.log('   Recipient:', verifyData.data.recipient_name, '| Award:', verifyData.data.issued_for_label);

    // 17. User Profile Update
    console.log('17. Testing User Profile Update (PUT /auth/me)...');
    const updateMeRes = await fetch(`${baseUrl}/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: userCookie },
      body: JSON.stringify({
        fullName: 'Dr. Alan M. Turing, FRS',
        affiliation: 'Cambridge Centre for Advanced Computation',
        bio: 'Pioneer of theoretical computer science, cryptography, and artificial intelligence.',
      }),
    });
    const updateMeData = await updateMeRes.json();
    if (!updateMeData.success || updateMeData.data.fullName !== 'Dr. Alan M. Turing, FRS') {
      throw new Error('User profile update failed: ' + JSON.stringify(updateMeData));
    }
    console.log('✔ Profile updated successfully. New Name:', updateMeData.data.fullName);

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 2 BACKEND ENDPOINTS AND WORKFLOWS PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
