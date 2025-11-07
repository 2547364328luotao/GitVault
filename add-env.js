const { execSync } = require('child_process');

const envVars = {
  IMAP_USER: 'github@luotao.qzz.io',
  IMAP_PASSWORD: '20050508luoTAO',
  IMAP_HOST: 'imap.qiye.aliyun.com',
  IMAP_PORT: '993'
};

for (const [key, value] of Object.entries(envVars)) {
  console.log(`Adding ${key}...`);
  try {
    execSync(`echo ${value} | npx vercel env add ${key} production`, {
      stdio: 'inherit',
      shell: true
    });
    console.log(`✅ Added ${key}`);
  } catch (error) {
    console.error(`❌ Failed to add ${key}:`, error.message);
  }
}
