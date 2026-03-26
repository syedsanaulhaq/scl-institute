const mysql = require('mysql2/promise');
const https = require('https');
const http = require('http');

const MOODLE_URL = process.env.MOODLE_INTERNAL_URL || 'http://host.docker.internal:9090';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

async function callMoodleRest(wsfunction, params) {
    return new Promise((resolve, reject) => {
        const FormData = require('form-data');
        const form = new FormData();
        form.append('wstoken', MOODLE_TOKEN);
        form.append('wsfunction', wsfunction);
        form.append('moodlewsrestformat', 'json');
        // Flatten params into form
        function appendParam(key, value) {
            if (Array.isArray(value)) {
                value.forEach((item, i) => appendParam(`${key}[${i}]`, item));
            } else if (value !== null && typeof value === 'object') {
                Object.entries(value).forEach(([k, v]) => appendParam(`${key}[${k}]`, v));
            } else {
                form.append(key, String(value));
            }
        }
        Object.entries(params).forEach(([k, v]) => appendParam(k, v));
        
        const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
        const lib = url.protocol === 'https:' ? https : http;
        const req = lib.request(url, { method: 'POST', headers: form.getHeaders() }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
            });
        });
        req.on('error', reject);
        form.pipe(req);
    });
}

(async () => {
    const c = await mysql.createConnection({
        host: process.env.MOODLE_DATABASE_HOST,
        port: Number(process.env.MOODLE_DATABASE_PORT || 3306),
        user: process.env.MOODLE_DATABASE_USER,
        password: process.env.MOODLE_DATABASE_PASSWORD,
        database: process.env.MOODLE_DATABASE_NAME
    });
    
    // Get current TES hierarchy from DB
    const [cats] = await c.execute(
        `SELECT id, name, idnumber, parent, depth, path
         FROM mdl_course_categories
         WHERE idnumber LIKE 'TES%'
         ORDER BY depth ASC, id ASC`
    );
    console.log('Current TES categories in DB:');
    cats.forEach(c => console.log(`  id=${c.id} "${c.name}" idnumber=${c.idnumber} parent=${c.parent} depth=${c.depth} path=${c.path}`));
    
    // Re-update each one via REST API to ensure Moodle's cache is updated
    console.log('\nRe-parenting via Moodle REST API...');
    for (const cat of cats) {
        const result = await callMoodleRest('core_course_update_categories', {
            categories: [{
                id: cat.id,
                name: cat.name,
                parent: cat.parent,
                idnumber: cat.idnumber
            }]
        });
        console.log(`  Updated id=${cat.id} "${cat.name}": ${JSON.stringify(result)}`);
    }
    
    await c.end();
    console.log('\nDone.');
})().catch(e => { console.error(e.message); process.exit(1); });
