// Verification script to check PayPal integration setup
// Run with: node scripts/verify-paypal-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PayPal Integration Setup...\n');

let hasErrors = false;

// Check 1: Verify PayPal files exist
console.log('1. Checking PayPal integration files...');
const requiredFiles = [
  'app/api/paypal/create-subscription/route.ts',
  'app/api/paypal/webhook/route.ts',
  'app/api/paypal/list-plans/route.ts',
  'lib/paypal/config.ts',
  'lib/paypal/client.ts',
  'components/ProCheckoutButton.tsx',
  'supabase/migrations/006_add_paypal_subscription.sql',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
    hasErrors = true;
  }
});

// Check 2: Verify environment variables in .env.local
console.log('\n2. Checking environment variables in .env.local...');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'ENABLE_PAYPAL_CHECKOUT',
    'NEXT_PUBLIC_ENABLE_PAYPAL_CHECKOUT',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'PAYPAL_MODE',
    'PAYPAL_PLAN_ID',
    'PAYPAL_PRODUCT_ID',
  ];

  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      const match = envContent.match(new RegExp(`${varName}=(.+)`));
      const value = match ? match[1].trim() : '';
      if (value && value !== 'your_paypal_' && !value.includes('YOUR_')) {
        console.log(`   ✅ ${varName} is set`);
      } else {
        console.log(`   ⚠️  ${varName} is set but may need a real value`);
      }
    } else {
      console.log(`   ❌ ${varName} - MISSING!`);
      hasErrors = true;
    }
  });
} else {
  console.log('   ⚠️  .env.local file not found (this is okay if you only use Vercel env vars)');
}

// Check 3: Verify migration file content
console.log('\n3. Checking database migration file...');
const migrationPath = path.join(__dirname, '..', 'supabase/migrations/006_add_paypal_subscription.sql');
if (fs.existsSync(migrationPath)) {
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  if (migrationContent.includes('paypal_subscription_id') && migrationContent.includes('paypal_customer_id')) {
    console.log('   ✅ Migration file contains required PayPal fields');
  } else {
    console.log('   ❌ Migration file missing required fields');
    hasErrors = true;
  }
}

// Check 4: Verify webhook route handles events
console.log('\n4. Checking webhook route implementation...');
const webhookPath = path.join(__dirname, '..', 'app/api/paypal/webhook/route.ts');
if (fs.existsSync(webhookPath)) {
  const webhookContent = fs.readFileSync(webhookPath, 'utf8');
  const requiredEvents = [
    'BILLING.SUBSCRIPTION.CREATED',
    'BILLING.SUBSCRIPTION.ACTIVATED',
    'BILLING.SUBSCRIPTION.CANCELLED',
  ];
  
  requiredEvents.forEach(event => {
    if (webhookContent.includes(event)) {
      console.log(`   ✅ Handles ${event}`);
    } else {
      console.log(`   ⚠️  May not handle ${event}`);
    }
  });
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Some issues found. Please fix them before deploying.');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Ready for deployment.');
  console.log('\n📋 Next Steps:');
  console.log('   1. Add environment variables to Vercel');
  console.log('   2. Create webhook in PayPal Dashboard');
  console.log('   3. Test the subscription flow');
  console.log('\nSee PAYPAL_PRODUCTION_DEPLOYMENT.md for detailed instructions.');
  process.exit(0);
}
