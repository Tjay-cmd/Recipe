// Run this script to create a PayPal subscription plan
// Usage: node scripts/create-paypal-plan.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
console.log(`Reading .env from: ${envPath}`);
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const equalIndex = line.indexOf('=');
  if (equalIndex > 0) {
    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();
    env[key] = value;
  }
});

const PAYPAL_CLIENT_ID = env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = env.PAYPAL_CLIENT_SECRET;
const PAYPAL_PRODUCT_ID = env.PAYPAL_PRODUCT_ID;
const PAYPAL_MODE = env.PAYPAL_MODE || 'sandbox';

const baseUrl = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com',
      path: '/v1/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          resolve(parsed.access_token);
        } else {
          reject(new Error(`Failed to get access token: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write('grant_type=client_credentials');
    req.end();
  });
}

// Create product
async function createProduct(accessToken) {
  const productData = {
    name: 'YumSpot Pro',
    description: 'Premium recipe features including meal planning, shopping lists, and exclusive recipes',
    type: 'SERVICE',
    category: 'SOFTWARE'
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(productData);
    
    const options = {
      hostname: PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com',
      path: '/v1/catalogs/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to create product: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Create subscription plan
async function createPlan(accessToken, productId) {
  const planData = {
    product_id: productId,
    name: 'YumSpot Pro - Monthly',
    description: 'Monthly subscription to YumSpot Pro features',
    billing_cycles: [
      {
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 = infinite
        pricing_scheme: {
          fixed_price: {
            value: '3',
            currency_code: 'USD'
          }
        }
      }
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      payment_failure_threshold: 3
    }
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(planData);
    
    const options = {
      hostname: PAYPAL_MODE === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com',
      path: '/v1/billing/plans',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to create plan: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  try {
    console.log('📋 Configuration:');
    console.log(`   Mode: ${PAYPAL_MODE}`);
    console.log(`   Client ID: ${PAYPAL_CLIENT_ID?.substring(0, 15)}...`);
    console.log(`   Client Secret: ${PAYPAL_CLIENT_SECRET?.substring(0, 10)}...`);
    console.log(`   Product ID: ${PAYPAL_PRODUCT_ID}`);
    
    console.log('\n🔐 Getting PayPal access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Got access token');

    console.log('\n📦 Creating product...');
    const product = await createProduct(accessToken);
    console.log(`✅ Product created: ${product.id}`);

    console.log('\n📝 Creating subscription plan...');
    const plan = await createPlan(accessToken, product.id);
    
    console.log('\n🎉 SUCCESS! Plan created:');
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Plan ID: ${plan.id}`);
    console.log(`   Name: ${plan.name}`);
    console.log(`   Status: ${plan.status}`);
    
    console.log('\n📋 Update your .env.local file:');
    console.log(`   PAYPAL_PRODUCT_ID=${product.id}`);
    console.log(`   PAYPAL_PLAN_ID=${plan.id}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
