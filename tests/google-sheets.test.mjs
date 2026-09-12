import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
function harness(kind = "join") {
  const books=new Map(), props=new Map(); let held=false;
  function sheet() {const rows=[];return {getLastRow:()=>rows.length,setFrozenRows(){},setRightToLeft(){},getRange(row,col,n,width){const range={setValues(values){values.forEach((v,i)=>{rows[row-1+i]??=[];v.forEach((x,j)=>rows[row-1+i][col-1+j]=x);});return range;},setRichTextValues(values){return range.setValues(values.map(r=>r.map(v=>v.text)));},setFontWeight(){return range;},setWrap(){return range;},getValues(){return Array.from({length:n},(_,i)=>Array.from({length:width},(_,j)=>rows[row-1+i]?.[col-1+j]??''));},getDisplayValues(){return range.getValues().map(r=>r.map(String));}};return range;}};}
  const context=vm.createContext({ContentService:{MimeType:{JSON:'json'},createTextOutput(text){return {setMimeType(){return JSON.parse(text);}};}},PropertiesService:{getScriptProperties(){return {getProperty:k=>props.get(k),setProperty(k,v){props.set(k,v);}};}},LockService:{getScriptLock(){return {tryLock(){assert.equal(held,false);held=true;return true;},releaseLock(){held=false;}};}},SpreadsheetApp:{openById(id){if(!books.has(id)) books.set(id,new Map());const b=books.get(id);return {getSheetByName:n=>b.get(n),insertSheet(n){const s=sheet();b.set(n,s);return s;}};},newRichTextValue(){return {setText(text){return {build:()=>({text})};}};},flush(){}},UrlFetchApp:{fetch(){throw Error('Unexpected authentication call');}}});
  vm.runInContext(readFileSync('integrations/google-sheets/Code.gs','utf8'),context);
  props.set("FORM_KIND", kind);
  context.setup();return {context,props,post:b=>context.doPost({postData:{contents:JSON.stringify(b)}})};
}
const data={fullName:'Test Student',email:'test@smail.ucas.edu.ps',phone:'',studentId:'012345678',major:'تصميم و برمجة تطبيقات الموبايل',preferredCommittee:'media',message:'=HYPERLINK("test")'};
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
test('closed by default; exactly 40 applications; duplicate retries do not count',()=>{
 const {context,props,post}=harness();
 assert.equal(post({action:'join',requestId:id(1),data}).code,'JOIN_CLOSED');
 props.set('JOIN_SETTINGS',JSON.stringify({enabled:true,limit:40}));
 for(let n=1;n<=40;n++){const result=post({action:'join',requestId:id(n),data:{...data,studentId:String(n).padStart(9,'0')}});assert.equal(result.ok,true);assert.equal(result.registration.count,n);}
 assert.equal(post({action:'join',requestId:id(41),data}).code,'JOIN_CLOSED');
 assert.equal(post({action:'join',requestId:id(40),data}).duplicate,true);
 assert.equal(context.doGet().registration.count,40);
 assert.equal(context.doGet().registration.open,false);
});
test('student duplicates rejected; contact independent; literal text preserved; unauthorized config rejected',()=>{
 const {context,props,post}=harness();props.set('JOIN_SETTINGS',JSON.stringify({enabled:true,limit:40}));
 assert.equal(post({action:'join',requestId:id(1),data}).ok,true);
 assert.equal(post({action:'join',requestId:id(2),data}).code,'ALREADY_REGISTERED');
 const stored=vm.runInContext("sheet_('join').getRange(2,1,1,9).getValues()[0]",context);
 assert.equal(stored[5],'012345678');assert.equal(stored[8],data.message);
 props.set('JOIN_SETTINGS',JSON.stringify({enabled:false,limit:40}));
 assert.equal(harness('contact').post({action:'contact',requestId:id(3),data:{name:'Test Name',email:data.email,message:data.message}}).ok,true);
 assert.equal(post({action:'configure',enabled:true,limit:99}).code,'UNAUTHORIZED');
 assert.equal(context.doGet().registration.limit,40);
 assert.equal(post({action:'contact',requestId:id(4),data:{name:'x'}}).code,'INVALID_INPUT');
});

test('separate contact deployment cannot accept join or configure registration',()=>{
 const {post}=harness('contact');
 assert.equal(post({action:'join',requestId:id(1),data}).code,'INVALID_INPUT');
 assert.equal(post({action:'configure',enabled:true,limit:100}).code,'INVALID_INPUT');
});
test('join validates university email and numeric phone and student ID',()=>{
 for(const patch of [{phone:'0571234567'},{phone:'05912345'},{phone:'05612345678'},{phone:'059abcdefg'},{email:'test@example.com'},{email:'test@smail.ucas.edu.ps.evil.com'},{studentId:'12345678'},{studentId:'12345678a'}]) {
  const {props,post}=harness();props.set('JOIN_SETTINGS',JSON.stringify({enabled:true,limit:40}));
  assert.equal(post({action:'join',requestId:id(1),data:{...data,...patch}}).code,'INVALID_INPUT');
 }
 for(const phone of ['056123456','059123456','0561234567','0591234567','']) {
  const {props,post}=harness();props.set('JOIN_SETTINGS',JSON.stringify({enabled:true,limit:40}));
  assert.equal(post({action:'join',requestId:id(1),data:{...data,phone}}).ok,true);
 }
});
