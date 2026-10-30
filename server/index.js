import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from './config/supabaseClient.js';
import authRoutes from './routes/authRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Strict CORS Configuration for Render / Production Deployment
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(u => u.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (health checks, server-to-server, curl)
    if (!origin) return callback(null, true);
    // Allow configured origins, all origins in dev, or any *.vercel.app domain
    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AgenticSync API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Seed Initial Demo Users (For immediate seamless testing & evaluation)
async function seedInitialDemoData() {
  try {
    const existingAdmin = await db.users.findByEmail('admin@agenticsync.ai');
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash('admin123', salt);
      const memberHash = await bcrypt.hash('member123', salt);

      const adminUser = await db.users.create({
        email: 'admin@agenticsync.ai',
        password_hash: adminHash,
        role: 'admin'
      });

      const memberUser = await db.users.create({
        email: 'dev@agenticsync.ai',
        password_hash: memberHash,
        role: 'member'
      });

      // Seed a sample code snippet with verification
      const sampleCode1 = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}
module.exports = calculateTotal;`;

      const sampleUpload = await db.codeUploads.create({
        user_id: memberUser.id,
        file_name: 'calculateTotal.js',
        code_content: sampleCode1,
        ai_status: 'verified',
        ai_feedback: `## 🤖 Autonomous AI Agent Verification Report for \`calculateTotal.js\`

✅ **STATUS: VERIFIED** &nbsp;&nbsp;|&nbsp;&nbsp; **Code Health Score:** \`96/100\`

### 📋 Executive Summary
Clean array traversal and correct arithmetic calculation logic. No side effects or unsafe mutations observed.

---

### 🔍 Identified Issues & Logic Checks
✨ *No critical logic bugs or security vulnerabilities detected.*

---

### 🧪 Simulated Autonomous Test Suites
| Status | Test Description | Notes |
|:------|:-----------------|:------|
| \`🟢 PASS\` | **Empty array handling** | Returned 0 as expected |
| \`🟢 PASS\` | **Multi-item cart calculation** | Accurately computed aggregated product total |
| \`🟢 PASS\` | **Floating point quantities** | Evaluated without precision collapse |

### 🚀 Agentic Recommendations
- Consider adding defensive checks to verify \`items\` is an Array (\`Array.isArray(items)\`).
`
      });

      // Sample bugged code
      const sampleCode2 = `function fetchUser(userId) {
  // Vulnerable to SQL Injection
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.query(query);
}`;

      await db.codeUploads.create({
        user_id: memberUser.id,
        file_name: 'vulnerableQuery.js',
        code_content: sampleCode2,
        ai_status: 'bugged',
        ai_feedback: `## 🤖 Autonomous AI Agent Verification Report for \`vulnerableQuery.js\`

❌ **STATUS: BUGGED** &nbsp;&nbsp;|&nbsp;&nbsp; **Code Health Score:** \`38/100\`

### 📋 Executive Summary
Critical security vulnerability detected. The function directly concatenates unsanitized user input into an SQL query string, enabling severe SQL injection attacks.

---

### 🔍 Identified Issues & Logic Checks
- 🔴 **[CRITICAL]** Line 3: **Potential SQL Injection Vulnerability**
  *Unsanitized string interpolation or concatenation found inside SQL query string. Use parameterized queries.*
- 🟡 **[WARNING]** Line 1: **Missing Error Handling**
  *Database promise query has no try/catch block or error propagation.*

---

### 🧪 Simulated Autonomous Test Suites
| Status | Test Description | Notes |
|:------|:-----------------|:------|
| \`🔴 FAIL\` | **SQL Injection Exploit Simulation** | Payload \`1 OR 1=1\` bypassed query constraint |
| \`🟢 PASS\` | **Function signature check** | Parameters matched standard invocation |

### 💡 Suggested Autonomous Fix / Refactoring
\`\`\`javascript
async function fetchUser(userId) {
  // Safe parameterized query
  const query = "SELECT * FROM users WHERE id = $1";
  try {
    const result = await db.query(query, [userId]);
    return result.rows[0];
  } catch (err) {
    console.error("Database query failed:", err.message);
    throw err;
  }
}
\`\`\`
`
      });

      await db.activityLogs.log({
        user_id: adminUser.id,
        action_description: 'System initialized with demo credentials'
      });
      await db.activityLogs.log({
        user_id: memberUser.id,
        action_description: 'Uploaded "calculateTotal.js" — AI Agent Verdict: VERIFIED'
      });
      await db.activityLogs.log({
        user_id: memberUser.id,
        action_description: 'Uploaded "vulnerableQuery.js" — AI Agent Verdict: BUGGED'
      });

      console.log('🎉 Seeded demo users:');
      console.log('   Admin:  admin@agenticsync.ai / admin123');
      console.log('   Member: dev@agenticsync.ai / member123');
    }
  } catch (err) {
    console.warn('Seed data note:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 AgenticSync Server running on port ${PORT}`);
  await seedInitialDemoData();
});
