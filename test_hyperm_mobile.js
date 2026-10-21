/**
 * Verification Test Script for HYPERM SHOP Mobile API
 */

const hypermMobileHandler = require('./api/hyperm-mobile.js');

function mockReqRes(options) {
  const req = {
    method: options.method || 'POST',
    url: options.url || '/api/hyperm-mobile',
    headers: options.headers || { host: 'localhost:3000' },
    body: options.body || {},
    query: options.query || {}
  };

  let statusCode = 200;
  let headers = {};
  let responseData = '';

  const res = {
    statusCode: 200,
    setHeader: (k, v) => { headers[k] = v; },
    end: (data) => {
      responseData = data;
    }
  };

  return {
    req,
    res,
    getResponse: () => {
      try {
        return {
          status: res.statusCode,
          headers,
          data: JSON.parse(responseData)
        };
      } catch (e) {
        return {
          status: res.statusCode,
          headers,
          raw: responseData
        };
      }
    }
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('   HYPERM SHOP MOBILE API - COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} - ${detail}`);
      failed++;
    }
  }

  // TEST 1: Root / Health Check (GET)
  {
    const { req, res, getResponse } = mockReqRes({ method: 'GET', url: '/api/hyperm-mobile' });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('1. Root Status returns HYPERM SHOP brand', resp.data?.brand === 'HYPERM SHOP');
    assert('1b. Endpoints list documented in root response', resp.data?.endpoints?.license !== undefined);
  }

  // TEST 2: Handshake / Init
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'POST',
      body: { action: 'init', ver: '2.4.1', device_model: 'Google Pixel 8' }
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('2. Mobile Init returns success & session token', resp.data?.success === true && resp.data?.sessionid?.startsWith('hyp_mob_'));
    assert('2b. Brand is HYPERM SHOP', resp.data?.brand === 'HYPERM SHOP');
  }

  // TEST 3: First License Verification & HWID Binding
  const testPhoneHWID = 'TEST-PHONE-DEVICE-001';
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'POST',
      body: {
        action: 'license',
        key: 'HYPERM-PHONE-DEMO-VIP',
        hwid: testPhoneHWID,
        device_model: 'OnePlus 12'
      }
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('3. First key authentication binds device successfully', resp.data?.success === true);
    assert('3b. Package is PHONE PANEL VIP', resp.data?.info?.package === 'PHONE PANEL VIP');
    assert('3c. Bound HWID matches phone', resp.data?.info?.hwid === testPhoneHWID);
  }

  // TEST 4: Same Device Connects Again (Should Succeed)
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'POST',
      body: {
        action: 'license',
        key: 'HYPERM-PHONE-DEMO-VIP',
        hwid: testPhoneHWID,
        device_model: 'OnePlus 12'
      }
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('4. Returning device login succeeds with matching HWID', resp.data?.success === true);
  }

  // TEST 5: Different Phone Tries to Use Same Key (Should Fail - HWID Mismatch Guard)
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'POST',
      body: {
        action: 'license',
        key: 'HYPERM-PHONE-DEMO-VIP',
        hwid: 'HACKER-PHONE-DIFFERENT-HWID',
        device_model: 'Other Phone'
      }
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('5. HWID Mismatch properly rejected (Device Lock active)', resp.data?.success === false && resp.data?.code === 'HWID_MISMATCH');
  }

  // TEST 6: Check Update Endpoint
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'GET',
      url: '/api/hyperm-mobile?action=check_update&ver=2.4.0'
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('6. Check update returns latest version info', resp.data?.success === true && resp.data?.latest_server_version === '2.4.1');
    assert('6b. Update available flag is true for older version', resp.data?.update_available === true);
  }

  // TEST 7: Shop Catalog
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'GET',
      url: '/api/hyperm-mobile?action=products'
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('7. Shop products returned with INR currency', resp.data?.success === true && resp.data?.currency === 'INR');
    assert('7b. Catalog includes Phone Panel packages', resp.data?.products?.some(p => p.package === 'PHONE PANEL VIP'));
  }

  // TEST 8: HWID Reset
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'POST',
      body: {
        action: 'hwid_reset',
        key: 'HYPERM-PHONE-DEMO-VIP',
        secret: 'hyperm_shop_sec_7f99a801e82b7c02b92138a011cd48f9'
      }
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('8. HWID reset succeeds', resp.data?.success === true && resp.data?.current_hwid === 'UNBOUND');
  }

  // TEST 9: Key Generation Endpoint
  {
    const { req, res, getResponse } = mockReqRes({
      method: 'POST',
      body: {
        action: 'create_key',
        admin_secret: 'hyperm_shop_sec_7f99a801e82b7c02b92138a011cd48f9',
        package: 'PHONE PANEL VIP',
        duration_days: 30,
        count: 2,
        client_name: 'TestBuyer'
      }
    });
    await hypermMobileHandler(req, res);
    const resp = getResponse();
    assert('9. Key generation creates 2 valid short keys', resp.data?.success === true && resp.data?.keys?.length === 2);
    assert('9b. Generated key is under 10 characters', resp.data?.keys[0]?.key?.length <= 10 && resp.data?.keys[0]?.key?.startsWith('HM-'));
  }

  // TEST 10: Zero References to PRTVSHOW
  {
    const code = require('fs').readFileSync('./api/hyperm-mobile.js', 'utf8');
    const hasPrtv = /prtvshow/i.test(code);
    assert('10. Independent code integrity: ZERO references to PRTVSHOW in new API', !hasPrtv);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
