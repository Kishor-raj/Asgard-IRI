const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const pool = require('./src/config/db');

// Start temporary test server
const server = http.createServer(app);

async function runTests() {
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098/api/v1';
  console.log('--- ASGARD-IRI Phase 3 Automated Verification Suite ---');
  console.log('Testing against:', baseUrl);

  let adminCookie = '';
  let researcherCookie = '';
  let researcherUserId = null;
  let researcherProfileId = null;
  let testOutputId = null;
  let testOutputSlug = null;
  let testProgramId = null;
  let testProgramSlug = null;
  let testApplicationId = null;

  function extractCookie(res) {
    const raw = res.headers.get('set-cookie');
    if (!raw) return '';
    return raw.split(';')[0];
  }

  try {
    // ----------------------------------------------------
    // 1. Admin Login & Researcher Authentication
    // ----------------------------------------------------
    console.log('\n[Suite 1: Authentication & Account Setup]');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@asgard-iri.org', password: 'SecurePass123!' }),
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.success) throw new Error('Admin login failed: ' + JSON.stringify(adminData));
    adminCookie = extractCookie(adminLoginRes);
    console.log('  ✔ Admin logged in successfully.');

    // Register / Ensure Researcher Account
    const scholarEmail = 'researcher_phase3@asgard.edu';
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: scholarEmail,
        password: 'Researcher@12345',
        fullName: 'Prof. Katherine Vance',
        role: 'researcher',
      }),
    });
    const regData = await regRes.json();

    if (regData.success) {
      researcherUserId = regData.data.id;
    } else {
      const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [scholarEmail]);
      researcherUserId = rows[0]?.id;
    }

    // Approve researcher if pending
    await pool.query("UPDATE users SET status = 'active' WHERE id = $1", [researcherUserId]);

    // Ensure researcher profile row exists
    const { rows: profRows } = await pool.query(
      `INSERT INTO researcher_profiles (user_id, designation, affiliation, research_interests, is_public)
       VALUES ($1, 'Lead Quantum Investigator', 'ASGARD Frontier Lab', 'Quantum Computing, Photonics, Superconductivity', true)
       ON CONFLICT (user_id) DO UPDATE SET is_public = true, designation = 'Lead Quantum Investigator'
       RETURNING id`,
      [researcherUserId]
    );
    researcherProfileId = profRows[0].id;

    // Login as researcher
    const scholarLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: scholarEmail, password: 'Researcher@12345' }),
    });
    const scholarData = await scholarLoginRes.json();
    if (!scholarData.success) throw new Error('Researcher login failed: ' + JSON.stringify(scholarData));
    researcherCookie = extractCookie(scholarLoginRes);
    console.log('  ✔ Researcher authenticated and profile verified (Profile ID:', researcherProfileId, ')');

    // ----------------------------------------------------
    // 2. Research Repository & Outputs
    // ----------------------------------------------------
    console.log('\n[Suite 2: Research Repository & Output CRUD]');
    // Query repository outputs
    const outputsRes = await fetch(`${baseUrl}/research/outputs?limit=10`);
    const outputsData = await outputsRes.json();
    if (!outputsData.success) throw new Error('GET /research/outputs failed');
    console.log(`  ✔ GET /research/outputs returned ${outputsData.data.length} outputs.`);

    // Admin create output
    const newOutputRes = await fetch(`${baseUrl}/admin/research/outputs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: 'Verifiable Quantum Cryptography on Distributed Satellite Nodes',
        type: 'working_paper',
        authorsText: 'Prof. Katherine Vance, Dr. Alan Turing',
        year: 2026,
        doi: '10.1016/j.asgard.2026.01.001',
        abstract: 'A comprehensive security protocol for entanglement distribution across low earth orbit nano-satellites.',
        url: 'https://asgard-iri.org/papers/quantum-satellites-2026.pdf',
      }),
    });
    const newOutputData = await newOutputRes.json();
    if (!newOutputData.success) throw new Error('POST /admin/research/outputs failed: ' + JSON.stringify(newOutputData));
    testOutputId = newOutputData.data.id;
    testOutputSlug = newOutputData.data.slug;
    console.log('  ✔ POST /admin/research/outputs created output ID:', testOutputId, 'Slug:', testOutputSlug);

    // Detail query by slug
    const detailRes = await fetch(`${baseUrl}/research/outputs/${testOutputSlug}`);
    const detailData = await detailRes.json();
    if (!detailData.success || detailData.data.id !== testOutputId) {
      throw new Error('GET /research/outputs/:slug failed to retrieve created output');
    }
    console.log('  ✔ GET /research/outputs/:slug retrieved output successfully.');

    // Admin update output
    const updateOutputRes = await fetch(`${baseUrl}/admin/research/outputs/${testOutputId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: 'Verifiable Quantum Cryptography on Distributed Satellite Constellations',
        type: 'monograph',
        year: 2026,
      }),
    });
    const updateOutputData = await updateOutputRes.json();
    if (!updateOutputData.success || updateOutputData.data.type !== 'monograph') {
      throw new Error('PUT /admin/research/outputs/:id failed');
    }
    console.log('  ✔ PUT /admin/research/outputs/:id updated output successfully.');

    // ----------------------------------------------------
    // 3. Researcher Output Linking & Academic Collaboration
    // ----------------------------------------------------
    console.log('\n[Suite 3: Researcher Output Linking & Collaboration]');
    // Link output to researcher profile
    const linkRes = await fetch(`${baseUrl}/researchers/me/link-output/${testOutputId}`, {
      method: 'POST',
      headers: { Cookie: researcherCookie },
    });
    const linkData = await linkRes.json();
    if (!linkData.success) throw new Error('POST /researchers/me/link-output/:id failed: ' + JSON.stringify(linkData));
    console.log('  ✔ POST /researchers/me/link-output/:id linked output to researcher.');

    // Verify linked outputs endpoint
    const myLinkedRes = await fetch(`${baseUrl}/researchers/me/linked-outputs`, {
      headers: { Cookie: researcherCookie },
    });
    const myLinkedData = await myLinkedRes.json();
    if (!myLinkedData.success || !myLinkedData.data.some((o) => o.id === testOutputId)) {
      throw new Error('GET /researchers/me/linked-outputs did not list linked output');
    }
    console.log('  ✔ GET /researchers/me/linked-outputs verified linked output in profile.');

    // Public researcher profile returns linkedOutputs
    const publicProfileRes = await fetch(`${baseUrl}/researchers/${researcherUserId}`);
    const publicProfileData = await publicProfileRes.json();
    if (!publicProfileData.success || !publicProfileData.data.linkedOutputs?.some((o) => o.id === testOutputId)) {
      throw new Error('GET /researchers/:id did not include linkedOutputs array');
    }
    console.log('  ✔ GET /researchers/:id verified linkedOutputs returned on public profile.');

    // Collaboration request
    const collabRes = await fetch(`${baseUrl}/researchers/${researcherUserId}/collaboration-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Gregory House',
        email: 'ghouse@princeton.edu',
        institution: 'Princeton Institute for Advanced Study',
        subject: 'Joint Satellite Entanglement Proposal',
        message: 'We would like to co-apply for the Horizon 2026 Quantum Frontier Grant.',
      }),
    });
    const collabData = await collabRes.json();
    if (!collabData.success) throw new Error('POST /researchers/:id/collaboration-request failed: ' + JSON.stringify(collabData));
    console.log('  ✔ POST /researchers/:id/collaboration-request sent collaboration inquiry.');

    // ----------------------------------------------------
    // 4. Innovation Hub Workflows
    // ----------------------------------------------------
    console.log('\n[Suite 4: Innovation Hub & Venture Workflows]');
    // Get programs
    const progsRes = await fetch(`${baseUrl}/innovation/programs`);
    const progsData = await progsRes.json();
    if (!progsData.success || progsData.data.length === 0) {
      throw new Error('GET /innovation/programs failed');
    }
    testProgramId = progsData.data[0].id;
    testProgramSlug = progsData.data[0].slug;
    console.log(`  ✔ GET /innovation/programs returned ${progsData.data.length} programmes.`);

    // Get program by slug
    const progSlugRes = await fetch(`${baseUrl}/innovation/programs/${testProgramSlug}`);
    const progSlugData = await progSlugRes.json();
    if (!progSlugData.success) throw new Error('GET /innovation/programs/:slug failed');
    console.log('  ✔ GET /innovation/programs/:slug retrieved program by slug.');

    // Get mentors
    const mentorsRes = await fetch(`${baseUrl}/innovation/mentors`);
    const mentorsData = await mentorsRes.json();
    if (!mentorsData.success) throw new Error('GET /innovation/mentors failed');
    console.log(`  ✔ GET /innovation/mentors returned ${mentorsData.data.length} mentors.`);

    // Apply to program with multipart PDF
    const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000118 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n185\n%%EOF');
    const boundary = '----WebKitFormBoundaryPhase3Test' + Math.random().toString(36).substring(2);
    let body = '';
    body += `--${boundary}\r\nContent-Disposition: form-data; name="teamName"\r\n\r\nQuantumPhotonics LLC\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="memberNames"\r\n\r\nProf. Katherine Vance, Dr. E. Rostova\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="projectTitle"\r\n\r\nUltra-Low Loss Silicon Photonic Transceiver for QKD\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="domain"\r\n\r\nQuantum & Frontier Computing\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="brief"; filename="project_brief.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(body, 'utf-8'),
      dummyPdf,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8'),
    ]);

    const applyRes = await fetch(`${baseUrl}/innovation/programs/${testProgramId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Cookie: researcherCookie,
      },
      body: bodyBuffer,
    });
    const applyData = await applyRes.json();
    if (!applyData.success) throw new Error('POST /innovation/programs/:id/apply failed: ' + JSON.stringify(applyData));
    testApplicationId = applyData.data.id;
    console.log('  ✔ POST /innovation/programs/:id/apply submitted application ID:', testApplicationId);

    // Verify application in my applications
    const myInnoAppsRes = await fetch(`${baseUrl}/my/innovation-applications`, {
      headers: { Cookie: researcherCookie },
    });
    const myInnoAppsData = await myInnoAppsRes.json();
    if (!myInnoAppsData.success || !myInnoAppsData.data.some((a) => a.id === testApplicationId)) {
      throw new Error('GET /my/innovation-applications did not list submitted application');
    }
    console.log('  ✔ GET /my/innovation-applications verified applicant can view their application.');

    // Admin review application status
    const updateInnoStatusRes = await fetch(`${baseUrl}/admin/innovation/applications/${testApplicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        status: 'accepted',
        reviewNotes: 'Welcome to the ASGARD Deep-Tech Cohort 2026. Seed grant allocated.',
      }),
    });
    const updateInnoStatusData = await updateInnoStatusRes.json();
    if (!updateInnoStatusData.success || updateInnoStatusData.data.status !== 'accepted') {
      throw new Error('PATCH /admin/innovation/applications/:id/status failed: ' + JSON.stringify(updateInnoStatusData));
    }
    console.log('  ✔ PATCH /admin/innovation/applications/:id/status reviewed and accepted application.');

    // Admin Innovation CSV Export
    const innoExportRes = await fetch(`${baseUrl}/admin/innovation/applications/export`, {
      headers: { Cookie: adminCookie },
    });
    const innoCsvText = await innoExportRes.text();
    if (!innoCsvText.includes('QuantumPhotonics LLC') && !innoCsvText.includes('Application ID')) {
      throw new Error('GET /admin/innovation/applications/export did not return valid CSV content');
    }
    console.log('  ✔ GET /admin/innovation/applications/export generated CSV successfully.');

    // ----------------------------------------------------
    // 5. Full-Text Search (PostgreSQL tsvector & ts_rank)
    // ----------------------------------------------------
    console.log('\n[Suite 5: Advanced Full-Text Search Engine]');
    const searchRes = await fetch(`${baseUrl}/search?q=quantum`);
    const searchData = await searchRes.json();
    if (!searchData.success || typeof searchData.data?.counts?.total !== 'number') {
      throw new Error('GET /search?q=quantum failed: ' + JSON.stringify(searchData));
    }
    console.log(`  ✔ GET /search?q=quantum returned total matches: ${searchData.data.counts.total}`);
    console.log(`    - Outputs: ${searchData.data.counts.outputs}`);
    console.log(`    - Publications: ${searchData.data.counts.publications}`);
    console.log(`    - Opportunities: ${searchData.data.counts.opportunities}`);
    console.log(`    - Researchers: ${searchData.data.counts.researchers}`);

    // Filtered search with year range
    const searchYearRes = await fetch(`${baseUrl}/search?q=quantum&type=outputs&yearFrom=2024&yearTo=2026`);
    const searchYearData = await searchYearRes.json();
    if (!searchYearData.success) throw new Error('GET /search with year filter failed');
    console.log(`  ✔ GET /search with year facet (2024-2026) returned ${searchYearData.data.counts.outputs} outputs.`);

    // ----------------------------------------------------
    // 6. Admin Reports Summary & Universal CSV Exports
    // ----------------------------------------------------
    console.log('\n[Suite 6: Admin Reports & Universal CSV Exports]');
    const reportsRes = await fetch(`${baseUrl}/admin/reports/summary`, {
      headers: { Cookie: adminCookie },
    });
    const reportsData = await reportsRes.json();
    if (!reportsData.success || !reportsData.data.users || !reportsData.data.innovation) {
      throw new Error('GET /admin/reports/summary failed: ' + JSON.stringify(reportsData));
    }
    console.log('  ✔ GET /admin/reports/summary returned aggregated metrics:');
    console.log(`    - Users: ${reportsData.data.users.total} (Active: ${reportsData.data.users.active}, Pending: ${reportsData.data.users.pending})`);
    console.log(`    - Opportunity Applications: ${reportsData.data.applications.total}`);
    console.log(`    - Academy Registrations: ${reportsData.data.academy.registrations}`);
    console.log(`    - Research Outputs: ${reportsData.data.research.outputs}`);
    console.log(`    - Conferences: ${reportsData.data.conferences.count} (Submissions: ${reportsData.data.conferences.submissions})`);
    console.log(`    - Innovation Applications: ${reportsData.data.innovation.applications}`);

    // Opportunity Applications CSV Export
    const oppCsvRes = await fetch(`${baseUrl}/admin/applications/export`, {
      headers: { Cookie: adminCookie },
    });
    const oppCsvText = await oppCsvRes.text();
    if (!oppCsvText.includes('Application ID')) {
      throw new Error('GET /admin/applications/export failed to produce CSV headers');
    }
    console.log('  ✔ GET /admin/applications/export generated opportunity applications CSV successfully.');

    // ----------------------------------------------------
    // Cleanup created test output
    // ----------------------------------------------------
    await fetch(`${baseUrl}/admin/research/outputs/${testOutputId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    console.log('\n[Cleanup]');
    console.log('  ✔ DELETE /admin/research/outputs/:id cleaned up test output.');

    console.log('\n======================================================');
    console.log(' 🎉 ALL PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! ');
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
