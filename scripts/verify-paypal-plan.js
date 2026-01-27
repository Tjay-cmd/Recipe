/**
 * Verify PayPal Plan - Check if plan exists with current credentials
 * Run: node scripts/verify-paypal-plan.js
 */

const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const CLIENT_ID = env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = env.PAYPAL_CLIENT_SECRET;
const MODE = env.PAYPAL_MODE || 'sandbox';
const PLAN_ID = env.PAYPAL_PLAN_ID;
const PRODUCT_ID = env.PAYPAL_PRODUCT_ID;

console.log('🔍 PayPal Plan Verification');
console.log('================================');
console.log('Mode:', MODE);
console.log('Client ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 20)}...` : 'MISSING');
console.log('Product ID:', PRODUCT_ID);
console.log('Expected Plan ID:', PLAN_ID);
console.log('================================\n');

const baseUrl = MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Auth failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function verifyPlan(accessToken, planId) {
  console.log(`\n📋 Checking if Plan ${planId} exists...\n`);
  
  const response = await fetch(`${baseUrl}/v1/billing/plans/${planId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const plan = await response.json();
    console.log('✅ PLAN FOUND!');
    console.log('================================');
    console.log('Plan ID:', plan.id);
    console.log('Plan Name:', plan.name);
    console.log('Status:', plan.status);
    console.log('Product ID:', plan.product_id);
    console.log('Price:', plan.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value, plan.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.currency_code);
    console.log('================================\n');
    return true;
  } else {
    const error = await response.json();
    console.log('❌ PLAN NOT FOUND!');
    console.log('================================');
    console.log('Error:', error.name);
    console.log('Message:', error.message);
    console.log('Details:', JSON.stringify(error.details, null, 2));
    console.log('================================\n');
    return false;
  }
}

async function listAllPlans(accessToken, productId) {
  console.log(`\n📋 Listing all plans for Product ${productId}...\n`);
  
  const response = await fetch(`${baseUrl}/v1/billing/plans?product_id=${productId}&page_size=20`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const data = await response.json();
    const plans = data.plans || [];
    
    if (plans.length === 0) {
      console.log('⚠️  NO PLANS FOUND for this product');
      console.log('This means the product exists but has no plans created.\n');
    } else {
      console.log(`✅ Found ${plans.length} plan(s):`);
      console.log('================================');
      plans.forEach((plan, index) => {
        console.log(`\n${index + 1}. ${plan.name}`);
        console.log('   Plan ID:', plan.id);
        console.log('   Status:', plan.status);
        console.log('   Product ID:', plan.product_id);
        const price = plan.billing_cycles?.[0]?.pricing_scheme?.fixed_price;
        if (price) {
          console.log('   Price:', price.value, price.currency_code);
        }
      });
      console.log('\n================================\n');
    }
    return plans;
  } else {
    const error = await response.json();
    console.log('❌ Failed to list plans');
    console.log('Error:', error.message);
    return [];
  }
}

async function verifyProduct(accessToken, productId) {
  console.log(`\n📦 Checking if Product ${productId} exists...\n`);
  
  const response = await fetch(`${baseUrl}/v1/catalogs/products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const product = await response.json();
    console.log('✅ PRODUCT FOUND!');
    console.log('================================');
    console.log('Product ID:', product.id);
    console.log('Product Name:', product.name);
    console.log('Type:', product.type);
    console.log('================================\n');
    return true;
  } else {
    console.log('❌ PRODUCT NOT FOUND!');
    return false;
  }
}

async function main() {
  try {
    // Step 1: Get access token
    console.log('🔐 Getting access token...\n');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained\n');

    // Step 2: Verify Product
    const productExists = await verifyProduct(accessToken, PRODUCT_ID);
    
    if (!productExists) {
      console.log('❌ ERROR: Product does not exist!');
      console.log('You need to create the product first.\n');
      return;
    }

    // Step 3: Check if expected plan exists
    const planExists = await verifyPlan(accessToken, PLAN_ID);

    // Step 4: List all plans for the product
    const plans = await listAllPlans(accessToken, PRODUCT_ID);

    // Summary
    console.log('\n📊 SUMMARY');
    console.log('================================');
    if (planExists) {
      console.log('✅ Your plan ID is valid and working!');
      console.log('✅ No changes needed.');
    } else {
      console.log('❌ Your plan ID is NOT valid!');
      console.log('\n💡 SOLUTION:');
      if (plans.length > 0) {
        console.log('Use one of the plan IDs listed above, OR');
      }
      console.log('Run: node scripts/create-paypal-plan.js');
      console.log('This will create a new plan with your current credentials.');
    }
    console.log('================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
