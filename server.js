const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const WEB_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // API: Save data
  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(path.join(WEB_DIR, 'data.json'), JSON.stringify(data, null, 2));
        
        // Also update the markdown dashboard
        updateMarkdownDashboard(data);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(WEB_DIR, filePath);
  
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

// Update markdown dashboard when web dashboard changes
function updateMarkdownDashboard(data) {
  try {
    // Add default values to prevent crashes
    const safeData = {
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      pendingTasks: data.pendingTasks || [],
      awaitingInput: data.awaitingInput || [],
      activeProjects: data.activeProjects || [],
      scheduledJobs: data.scheduledJobs || [],
      completedTasks: data.completedTasks || [],
      notes: data.notes || []
    };

    const md = `# 🐕 Mission Dashboard
**Smart Dog Bot × Rick Lin**

*Last updated: ${new Date(safeData.lastUpdated).toLocaleString()}*

---

## 📋 Pending Tasks

| # | Task | Priority | Created | Status | Notes |
|---|------|----------|---------|--------|-------|
${safeData.pendingTasks.length === 0 ? '| — | *No pending tasks* | — | — | — | — |' : 
  safeData.pendingTasks.map((t, i) => `| ${i+1} | ${t.task} | ${t.priority} | ${t.created} | ${t.status} | ${t.notes || '—'} |`).join('\n')}

---

## ❓ Awaiting Rick's Input

| # | Question | Context | Asked | Status |
|---|----------|---------|-------|--------|
${safeData.awaitingInput.length === 0 ? '| — | *No pending questions* | — | — | — |' :
  safeData.awaitingInput.map((q, i) => `| ${i+1} | ${q.question} | ${q.context || '—'} | ${q.asked} | ${q.status} |`).join('\n')}

---

## 🔄 Active Projects

| Project | Description | Started | Status | Next Milestone |
|---------|-------------|---------|--------|----------------|
${safeData.activeProjects.map(p => `| ${p.name} | ${p.description} | ${p.started} | ${p.status} | ${p.nextMilestone} |`).join('\n')}

---

## ⏰ Scheduled Jobs

| Job | Schedule | Next Run | Description |
|-----|----------|----------|-------------|
${safeData.scheduledJobs.map(j => `| ${j.job} | ${j.schedule} | ${j.nextRun} | ${j.description} |`).join('\n')}

---

## ✅ Completed Tasks

| # | Task | Completed | Notes |
|---|------|-----------|-------|
${safeData.completedTasks.slice(0, 20).map((t, i) => `| ${i+1} | ${t.task} | ${t.completed} | ${t.notes || '—'} |`).join('\n')}

---

## 📊 Stats

| Metric | Count |
|--------|-------|
| Tasks Completed | ${safeData.completedTasks.length} |
| Tasks Pending | ${safeData.pendingTasks.length} |
| Questions Awaiting Input | ${safeData.awaitingInput.length} |
| Active Projects | ${safeData.activeProjects.filter(p => p.status === 'active').length} |
| Scheduled Jobs | ${safeData.scheduledJobs.length} |

---

## 📝 Notes & Decisions

${safeData.notes.map(n => `### ${n.date}\n${n.content}\n`).join('\n')}

---

*This dashboard is maintained by Smart Dog Bot 🐕*
*Location: \`/Users/yenfulin/.openclaw/workspace/DASHBOARD.md\`*
`;

    fs.writeFileSync(path.join(WEB_DIR, 'DASHBOARD.md'), md);
  } catch (error) {
    console.error('Error updating markdown dashboard:', error);
    // Don't crash the server, just log the error
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🐕 Mission Dashboard running at http://localhost:${PORT}`);
  console.log(`   Network: http://${getLocalIP()}:${PORT}`);
});

function getLocalIP() {
  const nets = require('os').networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}
