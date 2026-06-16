import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Load .env.local variables
function loadEnv() {
  if (!existsSync('.env.local')) return {};
  const env = {};
  const envFile = readFileSync('.env.local', 'utf-8');
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const raw = trimmed.slice(eqIdx + 1).trim();
    env[key] = raw.replace(/^"(.*)"$/, '$1');
  }
  return env;
}

function updateEnv(key, value) {
  let content = '';
  if (existsSync('.env.local')) {
    content = readFileSync('.env.local', 'utf-8');
  }
  
  const lines = content.split(/\r?\n/);
  let keyExists = false;
  
  const updatedLines = lines.map(line => {
    // Check if line starts with key=, ignoring spaces around key
    const parts = line.split('=');
    if (parts.length > 0 && parts[0].trim() === key) {
      keyExists = true;
      return `${key}="${value}"`;
    }
    return line;
  });
  
  if (!keyExists) {
    updatedLines.push(`${key}="${value}"`);
  }
  
  writeFileSync('.env.local', updatedLines.join('\n'), 'utf-8');
}

async function main() {
  const env = loadEnv();
  const rl = createInterface({ input, output });

  console.log('\n=========================================');
  console.log('      Supabase Add Admin CLI Script      ');
  console.log('=========================================\n');

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not defined in .env.local');
    rl.close();
    process.exit(1);
  }

  let serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.log('SUPABASE_SERVICE_ROLE_KEY was not found in .env.local.');
    console.log('The service_role key is required to bypass user registration confirmation emails.');
    serviceRoleKey = await rl.question('Please enter your SUPABASE_SERVICE_ROLE_KEY: ');
    serviceRoleKey = serviceRoleKey.trim();
    if (!serviceRoleKey) {
      console.error('Error: Service Role Key is required to create admin accounts.');
      rl.close();
      process.exit(1);
    }
    
    // Save it back to .env.local for future usage
    const saveKey = await rl.question('Would you like to save this key to .env.local? (y/n): ');
    if (saveKey.toLowerCase().startsWith('y')) {
      updateEnv('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);
      console.log('✓ Saved SUPABASE_SERVICE_ROLE_KEY to .env.local');
    }
  }

  const email = (await rl.question('Enter email for the new admin: ')).trim();
  if (!email) {
    console.error('Error: Email cannot be empty.');
    rl.close();
    process.exit(1);
  }

  const password = (await rl.question('Enter password for the new admin: ')).trim();
  if (!password || password.length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    rl.close();
    process.exit(1);
  }

  console.log('\nCreating user in Supabase Auth...');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      // If user already exists, let's see if we should still add it to ADMIN_EMAIL list
      if (error.message.includes('already registered') || error.status === 422) {
        console.log(`\nℹ User '${email}' is already registered in Supabase Auth.`);
        const addToEnv = await rl.question(`Would you like to add '${email}' to the authorized ADMIN_EMAIL list in .env.local? (y/n): `);
        if (addToEnv.toLowerCase().startsWith('y')) {
          authorizeEmail(email);
        }
      } else {
        console.error('\n✗ Error creating user:', error.message);
      }
    } else {
      console.log(`\n✓ Successfully created user '${email}' in Supabase Auth (auto-confirmed).`);
      authorizeEmail(email);
    }
  } catch (err) {
    console.error('\n✗ Unexpected error:', err.message || err);
  } finally {
    rl.close();
  }
}

function authorizeEmail(email) {
  // Load env again to ensure we have latest
  const latestEnv = loadEnv();
  const currentAdmins = latestEnv.ADMIN_EMAIL || '';
  const adminList = currentAdmins.split(',').map(e => e.trim()).filter(Boolean);
  
  if (adminList.some(e => e.toLowerCase() === email.toLowerCase())) {
    console.log(`ℹ '${email}' is already in the ADMIN_EMAIL list.`);
  } else {
    adminList.push(email);
    const updatedAdmins = adminList.join(', ');
    updateEnv('ADMIN_EMAIL', updatedAdmins);
    console.log(`✓ Added '${email}' to ADMIN_EMAIL in .env.local.`);
    console.log(`Current authorized admins: ${updatedAdmins}`);
  }
}

main();
