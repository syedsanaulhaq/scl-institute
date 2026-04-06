const axios = require('axios');

const TOKEN = 'e86dd021aaa42f78114e6c67cc9d8ff1';
const MOODLE = 'http://localhost:9090';

async function moodleCall(fn, params = {}) {
  const res = await axios.post(`${MOODLE}/webservice/rest/server.php`, null, {
    params: { wstoken: TOKEN, wsfunction: fn, moodlewsrestformat: 'json', ...params }
  });
  return res.data;
}

(async () => {
  try {
    // 1. Check API
    const cats = await moodleCall('core_course_get_categories');
    if (!Array.isArray(cats)) {
      console.log('API error:', JSON.stringify(cats).slice(0, 200));
      return;
    }

    console.log('=== All categories from Moodle API ===');
    cats.sort((a, b) => a.sortorder - b.sortorder);
    for (const c of cats) {
      const indent = '  '.repeat(c.depth);
      console.log(`${indent}[${c.id}] ${c.name} (parent=${c.parent}, depth=${c.depth}, sort=${c.sortorder})`);
    }

    // 2. Check jjj hierarchy specifically
    console.log('\n=== jjj hierarchy ===');
    const jjj = cats.find(c => c.name === 'jjj');
    if (jjj) {
      console.log(`Root: [${jjj.id}] ${jjj.name} parent=${jjj.parent} depth=${jjj.depth}`);
      const children = cats.filter(c => c.parent === jjj.id);
      for (const child of children) {
        console.log(`  Child: [${child.id}] ${child.name} parent=${child.parent} depth=${child.depth}`);
        const grandchildren = cats.filter(c => c.parent === child.id);
        for (const gc of grandchildren) {
          console.log(`    GrandChild: [${gc.id}] ${gc.name} parent=${gc.parent} depth=${gc.depth}`);
          const ggc = cats.filter(c => c.parent === gc.id);
          for (const g of ggc) {
            console.log(`      GG: [${g.id}] ${g.name} parent=${g.parent} depth=${g.depth}`);
          }
        }
      }
    }

    // 3. Try purging caches via API
    console.log('\n=== Attempting cache purge ===');
    try {
      const purge = await moodleCall('tool_mobile_call_external_functions', {
        'requests[0][function]': 'core_course_get_categories',
        'requests[0][arguments]': '{}'
      });
      console.log('Cache refresh triggered');
    } catch (e) {
      console.log('Cache purge method not available:', e.message);
    }

  } catch (e) {
    console.log('Error:', e.message);
  }
})();
