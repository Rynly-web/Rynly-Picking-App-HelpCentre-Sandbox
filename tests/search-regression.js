/** Run from the repository root with: node tests/search-regression.js */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const el=()=>({hidden:true,value:'',addEventListener(){},setAttribute(){},removeAttribute(){},replaceChildren(){},querySelectorAll(){return[];},blur(){}});
const elements=Object.fromEntries(['help-search','site-search','search-clear','search-results','search-status'].map(k=>[k,el()]));
const document={getElementById:id=>elements[id]||el(),querySelector:()=>el(),addEventListener(){}};
const window={addEventListener(){},scrollTo(){}};
const context={window,document,location:{hash:''},console};
function load(file){vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});}
load('assets/js/content.js');load('assets/js/search-keywords.js');load('assets/js/search.js');
const data=window.RYNLY_CONTENT;
const search=window.RYNLY_SEARCH_TEST.search;
const allRoutes=['','support','guides','faq'];
for(const guide of data.guides){const route='guides/'+guide.id; allRoutes.push(route);for(const video of guide.videos||[]) allRoutes.push(route+'/'+video.id);}
for(const faq of data.faqs) allRoutes.push('faq/'+faq.id);
const extra=window.RYNLY_SEARCH_KEYWORDS;
for(const route of allRoutes){assert(Array.isArray(extra[route])&&extra[route].length,`No search keywords for ${route}`);}
const cases=[
 ['close','faq/take-store-offline'],
 ['clousure','faq/take-store-offline'],
 ['closure','faq/take-store-offline'],
 ['close shop','faq/take-store-offline'],
 ['store closing','faq/take-store-offline'],
 ['pause online orders','faq/take-store-offline'],
 ['stop on demand orders','faq/take-store-offline'],
 ['temporarily close store','faq/take-store-offline'],
 ['how to pick an order','guides/picking-completing-an-order'],
 ['pick an order','guides/picking-completing-an-order'],
 ['how to cancel an order','faq/cancel-order'],
 ['how to troubleshoot new order alerts','guides/troubleshooting-common-issues/new-order-alerts-video'],
 ['bag scanning','guides/batch-picking-bag-scanning/bag-scanning-video'],
 ['41 slides','faq/complete-picking-guide'],
 ['missing payments','guides/troubleshooting-common-issues/missing-payments'],
 ['technical support','support'],
];
for(const [query,route] of cases){
  const results=search(query);
  const first=results[0]?.route;
  assert.equal(first,route,`Query: ${query} -> ${first}; expected: ${route}; got ${JSON.stringify(results)}`);
  assert(results.length<=3);
  assert(results.every(r=>allRoutes.includes(r.route)));
  console.log(`PASS ${JSON.stringify(query)} -> ${results[0]?.title}`);
}
assert.deepEqual(Array.from(search('how do i')),[]);
const appSource=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
assert(!appSource.includes('app.append(relatedSection('), 'Related sections must be appended via null-safe append helper');
console.log(`PASS keyword coverage for all ${allRoutes.length} pages`);
