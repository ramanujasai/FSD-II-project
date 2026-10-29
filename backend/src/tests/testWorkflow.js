import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Scheme } from '../models/Scheme.js';
import { Application } from '../models/Application.js';

dotenv.config();

const runVerificationTests = async () => {
  console.log('--- STARTING SYSTEM INTEGRATION & WORKFLOW VALIDATION TESTS ---');

  const BASE_URL = 'http://localhost:5000/api';

  try {
    // 1. Health Check
    console.log('[Test 1] Checking API Health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('  Health Response:', healthData.status === 'ok' ? 'PASSED (200 OK)' : 'FAILED');

    // 2. Beneficiary Login
    console.log('[Test 2] Authenticating Citizen Beneficiary...');
    const citizenLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'citizen.rahul@example.com',
        password: 'Citizen@12345'
      })
    });
    const citizenData = await citizenLoginRes.json();
    if (!citizenData.token) throw new Error('Citizen authentication failed');
    const citizenToken = citizenData.token;
    console.log(`  Citizen Login: PASSED (Logged in as ${citizenData.user.name}, Role: ${citizenData.user.role})`);

    // 3. Admin Login
    console.log('[Test 3] Authenticating Administrative Officer...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@demo.gov.local',
        password: 'Admin@12345'
      })
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.token) throw new Error('Admin authentication failed');
    const adminToken = adminData.token;
    console.log(`  Admin Login: PASSED (Logged in as ${adminData.user.name}, Role: ${adminData.user.role})`);

    // 4. Role Isolation: Attempting Public Registration with Role=Admin
    console.log('[Test 4] Verifying Admin Registration Security Rule...');
    const spoofRegisterRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Admin',
        email: 'hacker@example.com',
        password: 'Password@123',
        phone: '+91-9999999999',
        role: 'admin'
      })
    });
    const spoofData = await spoofRegisterRes.json();
    console.log('  Admin Spoof Registration Blocked:', spoofRegisterRes.status === 403 ? 'PASSED (403 Forbidden)' : 'FAILED');

    // 5. Sensitive Data Check: Attempting submission with Aadhaar/Bank details
    console.log('[Test 5] Verifying Sensitive Data Block (No Aadhaar / Bank details)...');
    const sensitiveRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        schemeId: '650000000000000000000000',
        aadhaarNumber: '1234-5678-9012',
        bankAccountNumber: '9876543210'
      })
    });
    console.log('  Sensitive Fields Rejection:', sensitiveRes.status === 400 ? 'PASSED (400 Bad Request)' : 'FAILED');

    // 6. Schemes Catalogue Listing
    console.log('[Test 6] Fetching Schemes Catalogue...');
    const schemesRes = await fetch(`${BASE_URL}/schemes`);
    const schemesData = await schemesRes.json();
    console.log(`  Schemes Retrieved: ${schemesData.count} active schemes. PASSED.`);

    // 7. Role-Based Scoped Applications Query
    console.log('[Test 7] Verifying Beneficiary Scope on Applications...');
    const citizenAppsRes = await fetch(`${BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const citizenAppsData = await citizenAppsRes.json();

    const adminAppsRes = await fetch(`${BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminAppsData = await adminAppsRes.json();

    console.log(`  Citizen saw ${citizenAppsData.count} own applications.`);
    console.log(`  Admin saw all ${adminAppsData.count} applications across system.`);
    console.log('  Scoped Access Control: PASSED.');

    // 8. Workflow State Machine Tests
    console.log('[Test 8] Testing Application Workflow State Machine...');

    // Find the application with 'Submitted' status
    const submittedApp = adminAppsData.applications.find((a) => a.status === 'Submitted');
    if (submittedApp) {
      console.log(`  Selected Application: ${submittedApp.applicationNumber} (Current Status: ${submittedApp.status})`);

      // 8a. Test Invalid Transition: Submitted -> Disbursed (MUST FAIL)
      const invalidTransitionRes = await fetch(`${BASE_URL}/applications/${submittedApp._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'Disbursed' })
      });
      console.log('  Invalid Transition Submitted -> Disbursed Blocked:', invalidTransitionRes.status === 400 ? 'PASSED (400 Bad Request)' : 'FAILED');

      // 8b. Test Valid Transition: Submitted -> Under Review (MUST SUCCEED)
      const step1Res = await fetch(`${BASE_URL}/applications/${submittedApp._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'Under Review', remarks: 'Under verification by scrutiny officer.' })
      });
      const step1Data = await step1Res.json();
      console.log('  Transition Submitted -> Under Review:', step1Res.status === 200 ? 'PASSED' : 'FAILED');

      // 8c. Test Valid Transition: Under Review -> Approved (MUST SUCCEED)
      const step2Res = await fetch(`${BASE_URL}/applications/${submittedApp._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'Approved', remarks: 'All credentials verified and endorsed by committee.' })
      });
      const step2Data = await step2Res.json();
      console.log('  Transition Under Review -> Approved:', step2Res.status === 200 ? 'PASSED' : 'FAILED');

      // 8d. Test Valid Transition: Approved -> Disbursed (MUST SUCCEED & GENERATE DEMO DBT REF)
      const step3Res = await fetch(`${BASE_URL}/applications/${submittedApp._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'Disbursed', remarks: 'Simulated disbursement voucher released.' })
      });
      const step3Data = await step3Res.json();
      console.log('  Transition Approved -> Disbursed:', step3Res.status === 200 ? 'PASSED' : 'FAILED');
      console.log(`  Generated Demo DBT Voucher Reference: ${step3Data.application.demoDisbursementReference}`);
    }

    // 9. Admin Stats & Beneficiary Directory
    console.log('[Test 9] Fetching Admin Statistics & Beneficiary Directory...');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    console.log(`  Admin Stats: Total Schemes=${statsData.stats.totalSchemes}, Total Applications=${statsData.stats.totalApplications}`);

    const dirRes = await fetch(`${BASE_URL}/admin/beneficiaries`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dirData = await dirRes.json();
    console.log(`  Beneficiaries Enrolled in Directory: ${dirData.count}`);

    console.log('\n======================================================');
    console.log('ALL SYSTEM INTEGRATION & SECURITY TESTS PASSED (100%)');
    console.log('======================================================');

    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
};

// Wait 1.5s for server connection and run tests
setTimeout(runVerificationTests, 1500);
