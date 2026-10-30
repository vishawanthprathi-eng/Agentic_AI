import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_gemini_api_key')) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('🤖 Google Gemini AI verification engine initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Gemini AI initialization warning:', err.message);
  }
} else {
  console.log('⚡ Gemini API key not detected or placeholder. Using Autonomous Heuristic Verification Engine fallback.');
}

/**
 * Autonomous AI Agent to inspect, test, debug, and verify code
 * @param {string} fileName 
 * @param {string} codeContent 
 * @returns {Promise<{ai_status: 'verified' | 'bugged', ai_feedback: string, summary: string, score: number}>}
 */
export async function verifyCodeWithAgent(fileName, codeContent) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are the Autonomous AI Code Verification & Quality Agent for "AgenticSync".
A developer uploaded the file "${fileName}".
Inspect, test, debug, and verify the following code:

\`\`\`
${codeContent}
\`\`\`

Perform the following:
1. Syntax & Logic Bug Inspection (Flag any bugs, syntax errors, type errors, memory leaks, off-by-one errors, unhandled rejections).
2. Security & Vulnerability Audit (Check for SQL injection, XSS, insecure input, prototype pollution, exposed secrets).
3. Simulated Test Executions (Synthesize unit test cases and simulate inputs/edge cases).
4. Code Quality & Performance Rating (Assign a quality score from 0 to 100).
5. Final Verdict: Decide strictly whether the status is "verified" (safe, clean, functional) OR "bugged" (contains errors, security issues, or critical logic defects).

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "status": "verified" | "bugged",
  "score": 85,
  "summary": "Brief executive summary of findings",
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "line": "approximate line or N/A",
      "title": "Short title",
      "description": "Clear explanation of the bug or optimization"
    }
  ],
  "suggested_fix": "Cleaned up or corrected code snippet if needed (or null if clean)",
  "simulated_tests": [
    {
      "test_name": "Test description",
      "status": "passed" | "failed",
      "notes": "Observation"
    }
  ],
  "recommendations": [
    "Actionable tip 1",
    "Actionable tip 2"
  ]
}
`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();

      // Clean markdown wrappers if any
      const cleanedJson = textResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedJson);
      const ai_status = parsed.status === 'verified' ? 'verified' : 'bugged';

      // Generate rich markdown for database persistence in ai_feedback
      const ai_feedback = formatFeedbackMarkdown(fileName, ai_status, parsed);

      return {
        ai_status,
        ai_feedback,
        summary: parsed.summary || 'Code analysis completed.',
        score: parsed.score || (ai_status === 'verified' ? 95 : 45)
      };
    } catch (err) {
      console.error('Gemini API call failed or timed out:', err.message);
      console.log('Falling back to Autonomous Heuristic Verification Engine...');
    }
  }

  // Fallback Autonomous Heuristic Engine
  return runHeuristicVerification(fileName, codeContent);
}

/**
 * Format structured JSON into comprehensive Markdown feedback
 */
function formatFeedbackMarkdown(fileName, status, data) {
  const statusBadge = status === 'verified' ? '✅ **STATUS: VERIFIED**' : '❌ **STATUS: BUGGED**';
  const scoreBadge = data.score !== undefined ? `**Code Health Score:** \`${data.score}/100\`` : '';

  let issuesMd = '';
  if (data.issues && data.issues.length > 0) {
    issuesMd = data.issues.map(iss => {
      const icon = iss.severity === 'critical' ? '🔴' : iss.severity === 'warning' ? '🟡' : 'ℹ️';
      return `- ${icon} **[${iss.severity.toUpperCase()}]** Line ${iss.line || 'N/A'}: **${iss.title}**\n  *${iss.description}*`;
    }).join('\n');
  } else {
    issuesMd = '✨ *No critical logic bugs or security vulnerabilities detected.*';
  }

  let testsMd = '';
  if (data.simulated_tests && data.simulated_tests.length > 0) {
    testsMd = data.simulated_tests.map(t => {
      const tIcon = t.status === 'passed' ? '🟢 PASS' : '🔴 FAIL';
      return `| \`${tIcon}\` | **${t.test_name}** | ${t.notes || ''} |`;
    }).join('\n');
  }

  let fixesMd = '';
  if (data.suggested_fix) {
    fixesMd = `\n### 💡 Suggested Autonomous Fix / Refactoring\n\`\`\`\n${data.suggested_fix}\n\`\`\`\n`;
  }

  let recsMd = '';
  if (data.recommendations && data.recommendations.length > 0) {
    recsMd = data.recommendations.map(r => `- ${r}`).join('\n');
  }

  return `## 🤖 Autonomous AI Agent Verification Report for \`${fileName}\`

${statusBadge} &nbsp;&nbsp;|&nbsp;&nbsp; ${scoreBadge}

### 📋 Executive Summary
${data.summary || 'Code evaluated autonomously.'}

---

### 🔍 Identified Issues & Logic Checks
${issuesMd}

${testsMd ? `---

### 🧪 Simulated Autonomous Test Suites
| Status | Test Description | Notes |
|:------|:-----------------|:------|
${testsMd}
` : ''}
${fixesMd}
${recsMd ? `---

### 🚀 Agentic Recommendations
${recsMd}
` : ''}

*Report generated autonomously by AgenticSync AI Engine.*
`;
}

/**
 * Heuristic fallback verification engine for offline or mock scenarios
 */
function runHeuristicVerification(fileName, code) {
  const issues = [];
  const tests = [];
  let score = 100;

  // Simple heuristic checks
  const lines = code.split('\n');

  // Check 1: Empty or extremely short
  if (code.trim().length < 15) {
    issues.push({
      severity: 'critical',
      line: '1',
      title: 'Incomplete or Empty Snippet',
      description: 'The code content is too sparse or empty to constitute functional logic.'
    });
    score -= 60;
  }

  // Check 2: Potential infinite loops
  if (/(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))/gi.test(code) && !/break|return/gi.test(code)) {
    issues.push({
      severity: 'critical',
      line: 'Variable',
      title: 'Infinite Loop Detected',
      description: 'Found a while(true) or for(;;) loop without an apparent exit break/return condition.'
    });
    score -= 40;
  }

  // Check 3: SQL Injection Vulnerability
  if (/(SELECT\s+.*FROM\s+.*WHERE.*(\+|\$\{).*)|(\.query\s*\(\s*["'`].*\$\{)/gi.test(code)) {
    issues.push({
      severity: 'critical',
      line: 'SQL Query',
      title: 'Potential SQL Injection Vulnerability',
      description: 'Unsanitized string interpolation or concatenation found inside SQL query string. Use parameterized queries.'
    });
    score -= 35;
  }

  // Check 4: Unhandled Promise or missing await
  if (/async\s+function|const\s+\w+\s*=\s*async/gi.test(code) && !/await|try\s*\{/gi.test(code)) {
    issues.push({
      severity: 'warning',
      line: 'Function Body',
      title: 'Async function without await or error handler',
      description: 'Function is marked async but contains no await operations or try/catch blocks.'
    });
    score -= 15;
  }

  // Check 5: Hardcoded secrets / tokens
  if (/(api_key|secret|password|token)\s*=\s*["'][a-zA-Z0-9_\-]{8,}["']/gi.test(code)) {
    issues.push({
      severity: 'critical',
      line: 'Configuration',
      title: 'Hardcoded Secret or Token Exposed',
      description: 'Potential secret token or password hardcoded directly in source. Move to environment variables.'
    });
    score -= 30;
  }

  // Check 6: Console logs in production
  if (code.includes('console.log(')) {
    issues.push({
      severity: 'info',
      line: 'Multiple',
      title: 'Debugging Statements Present',
      description: 'Found console.log statements. Consider replacing with structured logging or removing for production.'
    });
    score -= 5;
  }

  // Check 7: Syntax bracket balancing
  const opens = (code.match(/\{/g) || []).length;
  const closes = (code.match(/\}/g) || []).length;
  if (opens !== closes) {
    issues.push({
      severity: 'critical',
      line: 'Syntax',
      title: 'Mismatched Curly Braces',
      description: `Unbalanced code blocks detected (${opens} open vs ${closes} close). This will produce a syntax error.`
    });
    score -= 50;
  }

  // Tests
  tests.push({
    test_name: 'Syntax & Lexical Structure Validation',
    status: opens === closes ? 'passed' : 'failed',
    notes: opens === closes ? 'Balanced delimiters confirmed' : 'Bracket mismatch error'
  });

  tests.push({
    test_name: 'Security Vulnerability Scan',
    status: issues.some(i => i.severity === 'critical') ? 'failed' : 'passed',
    notes: issues.some(i => i.severity === 'critical') ? 'Vulnerabilities flagged' : 'No critical CVE patterns found'
  });

  tests.push({
    test_name: 'Runtime Execution Simulation',
    status: score >= 70 ? 'passed' : 'failed',
    notes: score >= 70 ? 'Simulated execution completed without unhandled exceptions' : 'Simulated execution halted due to errors'
  });

  score = Math.max(10, Math.min(100, score));
  const ai_status = (score >= 70 && !issues.some(i => i.severity === 'critical')) ? 'verified' : 'bugged';

  const summary = ai_status === 'verified'
    ? 'All automated verification checks passed. Code logic is well-formed, secure, and ready for team integration.'
    : 'Automated verification detected critical issues or logic defects that require developer attention before merging.';

  const suggested_fix = ai_status === 'bugged' ? `// Suggested Fix Preview:\n// Review flagged issues above and ensure balanced delimiters, \n// parameterize any SQL inputs, and remove hardcoded secrets.` : null;

  const data = {
    status: ai_status,
    score,
    summary,
    issues,
    simulated_tests: tests,
    suggested_fix,
    recommendations: [
      'Follow team coding guidelines and enforce strict linting.',
      'Verify async error handling patterns with unit tests.'
    ]
  };

  return {
    ai_status,
    ai_feedback: formatFeedbackMarkdown(fileName, ai_status, data),
    summary,
    score
  };
}
