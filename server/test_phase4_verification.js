const http = require('http');
const app = require('./src/app');
const pool = require('./src/config/db');

// Start temporary test server
const server = http.createServer(app);

async function runTests() {
  await new Promise((resolve) => server.listen(5097, resolve));
  const baseUrl = 'http://localhost:5097/api/v1';
  console.log('--- ASGARD-IRI Phase 4 Automated Verification Suite ---');
  console.log('Testing against:', baseUrl);

  let adminCookie = '';
  let testRequestId = null;

  function extractCookie(res) {
    const raw = res.headers.get('set-cookie');
    if (!raw) return '';
    return raw.split(';')[0];
  }

  try {
    // ----------------------------------------------------
    // 1. Admin Login
    // ----------------------------------------------------
    console.log('\n[Suite 1: Admin Authentication]');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@asgard-iri.org', password: 'SecurePass123!' }),
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.success) throw new Error('Admin login failed: ' + JSON.stringify(adminData));
    adminCookie = extractCookie(adminLoginRes);
    console.log('  ✔ Admin logged in successfully.');

    // ----------------------------------------------------
    // 2. Public Consultancy Request Workflow
    // ----------------------------------------------------
    console.log('\n[Suite 2: Consultancy Request Submission]');
    // Validation check: Missing required fields
    const invalidReqRes = await fetch(`${baseUrl}/consultancy/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete Request' }),
    });
    const invalidData = await invalidReqRes.json();
    if (invalidReqRes.status !== 400 || invalidData.success !== false) {
      throw new Error('Validation failed to reject incomplete consultancy request');
    }
    console.log('  ✔ POST /consultancy/request correctly validated required fields.');

    // Valid submission
    const validReqRes = await fetch(`${baseUrl}/consultancy/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Arthur Dent',
        organisation: 'Magrathea Planetary Systems & Research Ltd',
        email: 'arthur@magrathea.co.uk',
        phone: '+44 20 7946 0912',
        serviceType: 'AI & Enterprise Technology Solutions',
        projectDescription: 'We require an algorithmic bias auditing framework for computational genomics pipeline deployment.',
        budgetRange: '$5,000 – $25,000 / ₹4–20 Lakhs',
        preferredTimeline: '1-3 months',
      }),
    });
    const validData = await validReqRes.json();
    if (!validData.success || validData.data.status !== 'new') {
      throw new Error('Failed to submit consultancy request: ' + JSON.stringify(validData));
    }
    testRequestId = validData.data.id;
    console.log('  ✔ POST /consultancy/request created new request ID:', testRequestId);

    // ----------------------------------------------------
    // 3. Admin Consultancy Management & Review
    // ----------------------------------------------------
    console.log('\n[Suite 3: Admin Consultancy Governance & CSV Export]');
    // List requests
    const listRes = await fetch(`${baseUrl}/admin/consultancy/requests`, {
      headers: { Cookie: adminCookie },
    });
    const listData = await listRes.json();
    if (!listData.success || !listData.data.some((r) => r.id === testRequestId)) {
      throw new Error('GET /admin/consultancy/requests did not include created request');
    }
    console.log(`  ✔ GET /admin/consultancy/requests listed ${listData.data.length} requests.`);

    // Filter by status
    const filterRes = await fetch(`${baseUrl}/admin/consultancy/requests?status=new`, {
      headers: { Cookie: adminCookie },
    });
    const filterData = await filterRes.json();
    if (!filterData.success || !filterData.data.some((r) => r.id === testRequestId)) {
      throw new Error('GET /admin/consultancy/requests?status=new failed filter check');
    }
    console.log('  ✔ GET /admin/consultancy/requests?status=new filtered correctly.');

    // Update status to in_discussion
    const updateRes = await fetch(`${baseUrl}/admin/consultancy/requests/${testRequestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        status: 'in_discussion',
        adminNotes: 'Initial intake call conducted with Dr. Dent. Scoping document in draft.',
      }),
    });
    const updateData = await updateRes.json();
    if (!updateData.success || updateData.data.status !== 'in_discussion') {
      throw new Error('PATCH /admin/consultancy/requests/:id/status failed to update status');
    }
    console.log('  ✔ PATCH /admin/consultancy/requests/:id/status transitioned request to in_discussion.');

    // Invalid status validation
    const badStatusRes = await fetch(`${baseUrl}/admin/consultancy/requests/${testRequestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ status: 'unsupported_status' }),
    });
    if (badStatusRes.status !== 400) {
      throw new Error('Invalid status was not rejected with 400 Bad Request');
    }
    console.log('  ✔ PATCH /admin/consultancy/requests/:id/status rejected invalid status.');

    // Export CSV
    const csvRes = await fetch(`${baseUrl}/admin/consultancy/requests/export`, {
      headers: { Cookie: adminCookie },
    });
    const csvText = await csvRes.text();
    if (!csvText.includes('Client Name') || !csvText.includes('Magrathea Planetary Systems')) {
      throw new Error('GET /admin/consultancy/requests/export did not return valid CSV data');
    }
    console.log('  ✔ GET /admin/consultancy/requests/export generated CSV successfully.');

    // ----------------------------------------------------
    // 4. Public School Placeholder & Settings Toggle
    // ----------------------------------------------------
    console.log('\n[Suite 4: Public School Controlled Placeholder & Settings Toggle]');
    // Read public school visibility (public)
    const schoolStatusRes = await fetch(`${baseUrl}/settings/public-school-active`);
    const schoolStatusData = await schoolStatusRes.json();
    if (!schoolStatusData.success || typeof schoolStatusData.active !== 'boolean') {
      throw new Error('GET /settings/public-school-active failed');
    }
    console.log(`  ✔ GET /settings/public-school-active returned initial state: active = ${schoolStatusData.active}`);

    // Admin toggle ON
    const toggleOnRes = await fetch(`${baseUrl}/admin/settings/public-school-active`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ active: true }),
    });
    const toggleOnData = await toggleOnRes.json();
    if (!toggleOnData.success || toggleOnData.active !== true) {
      throw new Error('PUT /admin/settings/public-school-active failed to enable school visibility');
    }
    console.log('  ✔ PUT /admin/settings/public-school-active enabled visibility (active = true).');

    // Verify public endpoint reflects change
    const schoolStatusRes2 = await fetch(`${baseUrl}/settings/public-school-active`);
    const schoolStatusData2 = await schoolStatusRes2.json();
    if (!schoolStatusData2.success || schoolStatusData2.active !== true) {
      throw new Error('GET /settings/public-school-active did not reflect enabled state');
    }
    console.log('  ✔ GET /settings/public-school-active confirmed active = true.');

    // Admin toggle OFF (restore default hidden state)
    const toggleOffRes = await fetch(`${baseUrl}/admin/settings/public-school-active`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ active: false }),
    });
    const toggleOffData = await toggleOffRes.json();
    if (!toggleOffData.success || toggleOffData.active !== false) {
      throw new Error('PUT /admin/settings/public-school-active failed to disable school visibility');
    }
    console.log('  ✔ PUT /admin/settings/public-school-active restored hidden state (active = false).');

    // Non-admin authorization check
    const unauthorizedToggleRes = await fetch(`${baseUrl}/admin/settings/public-school-active`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true }),
    });
    if (unauthorizedToggleRes.status !== 401 && unauthorizedToggleRes.status !== 403) {
      throw new Error('Non-admin request to toggle setting was not blocked');
    }
    console.log('  ✔ PUT /admin/settings/public-school-active correctly enforced authorization.');

    // ----------------------------------------------------
    // 5. Audit Logging Verification
    // ----------------------------------------------------
    console.log('\n[Suite 5: Audit Trail Verification]');
    const { rows: auditRows } = await pool.query(
      `SELECT action, entity_type FROM audit_logs
       WHERE action IN ('UPDATE_CONSULTANCY_REQUEST_STATUS', 'TOGGLE_PUBLIC_SCHOOL_VISIBILITY')
       ORDER BY created_at DESC LIMIT 5`
    );
    if (auditRows.length === 0) {
      throw new Error('Audit logs did not record Phase 4 actions');
    }
    console.log(`  ✔ Verified ${auditRows.length} audit entries:`, auditRows.map((a) => a.action).join(', '));

    console.log('\n======================================================');
    console.log(' 🎉 ALL PHASE 4 VERIFICATION TESTS PASSED SUCCESSFULLY! ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await pool.end();
  }
}

runTests();
