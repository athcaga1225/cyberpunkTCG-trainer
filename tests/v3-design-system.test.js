'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'../v3'),cssNames=fs.readdirSync(dir).filter(n=>n.endsWith('.css'));
for(const name of cssNames){const src=fs.readFileSync(path.join(dir,name),'utf8');assert(!/!\s*important\b/i.test(src),name+': no priority flags');}
for(const name of fs.readdirSync(dir).filter(n=>/\.(js|html)$/.test(n))){const src=fs.readFileSync(path.join(dir,name),'utf8');assert(!/!\s*important\b/i.test(src),name+': no embedded CSS priority flags');assert(!/setProperty\([^;]+['"]important['"]/.test(src),name+': no runtime priority flags');}
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert(!/<style[\s>]/i.test(html),'page CSS lives in named external files');
const roles=fs.readFileSync(path.join(dir,'design-system.css'),'utf8');const sizes=[...roles.matchAll(/--nct-type-[\w-]+:(\d+)px/g)].map(m=>Number(m[1]));assert.deepEqual(sizes,[12,14,16,20,28,40],'one six-role type scale, controls at 16px');
for(const name of ['site.css','table-layout.css','table-theme.css','design-system.css'])assert(html.includes('v3/'+name+'?v='),'versioned stylesheet loaded: '+name);
console.log('PASS all V3 CSS/HTML/JS free of priority flags, external stylesheets, and six shared typography roles.');
