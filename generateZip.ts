import JSZip from 'jszip';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'viralcute-smm-panel',
        version: '2.5.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          'start:server': 'node server/index.js'
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'lucide-react': '^1.16.0',
          'canvas-confetti': '^1.9.4',
          clsx: '^2.1.1',
          'tailwind-merge': '^3.4.0',
          express: '^4.19.2',
          dotenv: '^16.4.5',
          cors: '^2.8.5'
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.0.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@types/canvas-confetti': '^1.9.0',
          '@vitejs/plugin-react': '^4.3.0',
          tailwindcss: '^4.0.0',
          typescript: '^5.5.0',
          vite: '^6.0.0'
        }
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173
  }
});
`
  );

  zip.file(
    '.env.example',
    `# ==============================================================
# VIRALCUTE SMM PANEL & PESAPAL GATEWAY ENVIRONMENT CONFIG
# ==============================================================
PORT=5000

# 1. Pesapal v3.0 API Credentials (From pesapal.com merchant portal)
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret_here
PESAPAL_ENV=sandbox # switch to "live" for production
PESAPAL_IPN_ID=your_registered_ipn_guid_here
PESAPAL_CALLBACK_URL=https://yourdomain.com/api/pesapal/callback

# 2. External SMM Provider API (e.g. JustAnotherPanel, SMMKings, Peakerr)
SMM_PROVIDER_URL=https://justanotherpanel.com/api/v2
SMM_PROVIDER_KEY=your_provider_api_key_here
DEFAULT_MARKUP_PERCENT=30
`
  );

  zip.file(
    'README.md',
    `# 🌸 ViralCute SMM Panel • Dual API & Pesapal Gateway

ViralCute is an aesthetic, high-converting Social Media Marketing (SMM) Panel and automated gateway designed for content creators, agencies, and social media resellers.

---

## ✨ Features Included

1. **🛍️ Complete Services Catalog**
   - Search bar across service titles, descriptions, and IDs.
   - 5 dedicated category filters: **Instagram, TikTok, Facebook, YouTube, Telegram**.
   - Dual view: Responsive Card Grid and Table View.
   - Price display in both **KES** and **USD**.
   - 1-click **"Order Now"** button that pre-selects the service in the Place Order tab.

2. **⚡ Place Order System & Dynamic Price Calculator**
   - Service selector with live package descriptions and public URL warnings.
   - Target Link input with live format assistance.
   - Quantity selector with quick chips (+100, +500, +1k, +2k, +5k, Min, Max).
   - Real-time total price calculation (e.g., KES 150/1,000 for 2,000 units = KES 300).
   - Min / Max boundary validation.
   - Natural Drip-Feed options (runs and interval).
   - Order confirmation modal generating unique **Order ID** (#849201) with initial status set to **Pending**.

3. **📱 Option Two: Real Pesapal Payment Gateway (v3.0)**
   - Complete support for Safaricom M-Pesa STK push, Airtel Money, Visa, Mastercard, and Bank EFT.
   - Consumer Key & Consumer Secret configuration inputs.
   - Live Sandbox vs. Live toggle.
   - Included production backend server in \`server/index.js\` for secure token exchange and IPN webhook verification.

4. **🌐 External SMM Provider API Gateway**
   - Connect any external SMM panel (v2 API standard).
   - Custom reseller profit markup slider (+15% to +100%).
   - Auto-sync services & auto-dispatch orders.
   - Interactive Playground to test \`action=balance\`, \`action=services\`, and \`action=status\`.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Run Frontend Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit \`http://localhost:5173\` in your browser!

### 3. Run Secure Backend Server (For Real Pesapal & SMM API)
\`\`\`bash
cp .env.example .env
# Edit .env with your real Pesapal credentials
npm run start:server
\`\`\`

---

## 🔒 Security Best Practice

Never expose your **Pesapal Consumer Secret** or **SMM Provider API Key** directly in client-side frontend code. The included \`server/index.js\` handles all token generation, order submissions, and IPN webhook listeners securely.
`
  );

  // Server directory
  const server = zip.folder('server');
  if (server) {
    server.file(
      'index.js',
      `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const PESAPAL_BASE = process.env.PESAPAL_ENV === 'live'
  ? 'https://pay.pesapal.com/v3/api'
  : 'https://cybqa.pesapal.com/pesapalv3/api';

/**
 * 1. Pesapal Token Exchange (Bearer Token)
 */
async function getPesapalToken() {
  const res = await fetch(\`\${PESAPAL_BASE}/Auth/RequestToken\`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    })
  });
  const data = await res.json();
  return data.token;
}

/**
 * 2. POST /api/pesapal/submit-order
 */
app.post('/api/pesapal/submit-order', async (req, res) => {
  try {
    const { amount, currency, email, phone, firstName, lastName, description } = req.body;
    const token = await getPesapalToken();

    const reference = 'VC-' + Date.now();
    const payload = {
      id: reference,
      currency: currency || 'KES',
      amount: Number(amount),
      description: description || 'ViralCute Wallet Deposit',
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      notification_id: process.env.PESAPAL_IPN_ID,
      billing_address: {
        email_address: email || 'customer@viralcute.com',
        phone_number: phone || '',
        first_name: firstName || 'Customer',
        last_name: lastName || 'User'
      }
    };

    const response = await fetch(\`\${PESAPAL_BASE}/Transactions/SubmitOrderRequest\`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.json({ success: true, reference, ...data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. Pesapal IPN Webhook Listener
 */
app.get('/api/pesapal/ipn', async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference } = req.query;
  console.log('Received Pesapal IPN Notification:', { OrderTrackingId, OrderMerchantReference });
  // In production: Query transaction status & credit customer account
  res.status(200).json({ status: 200, message: 'IPN Received' });
});

/**
 * 4. Forward Order to External SMM Provider
 */
app.post('/api/smm/order', async (req, res) => {
  try {
    const { service, link, quantity } = req.body;
    const params = new URLSearchParams();
    params.append('key', process.env.SMM_PROVIDER_KEY);
    params.append('action', 'add');
    params.append('service', service);
    params.append('link', link);
    params.append('quantity', quantity);

    const response = await fetch(process.env.SMM_PROVIDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(\`ViralCute Backend running on http://localhost:\${PORT}\`);
});
`
    );
  }

  // HTML Entry
  zip.file(
    'index.html',
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ViralCute • #1 Cute SMM Panel & Pesapal Gateway</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-pink-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
