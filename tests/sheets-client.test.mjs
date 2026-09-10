import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
function harness(responder) {
  const calls=[];let authCalls=0;
  function load(path) {const exports={};const js=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    vm.runInNewContext(js,{exports,AbortSignal,fetch:async(url,options)=>{calls.push({url,options});return responder(url,options);},require(name){if(name==='./model')return load('src/lib/club/model.ts');if(name==='./supabase')return {supabase(){authCalls++;return {auth:{getSession:async()=>({data:{session:{access_token:'test-session'}},error:null})}};}};return require(name);}});return exports;}
  return {api:load('src/lib/club/sheets.ts'),calls,authCalls:()=>authCalls};
}
const json=value=>({ok:true,headers:{get:()=> 'application/json'},json:async()=>value});
const contact={name:'Test Name',email:'test@example.com',message:'A sufficiently long message'};
test('contact targets its deployment and never accesses Supabase; retries preserve ID',async()=>{
 const h=harness(()=>json({ok:true}));await h.api.submitToSheet(false,contact,'request-1');await h.api.submitToSheet(false,contact,'request-1');
 assert.equal(h.authCalls(),0);assert.match(h.calls[0].url,/AKfycbxbRhHH/);assert.equal(JSON.parse(h.calls[1].options.body).requestId,'request-1');assert.equal(h.calls[0].options.credentials,'omit');assert.notEqual(h.calls[0].options.mode,'no-cors');
});
test('HTML login pages, script errors and network failures cannot report success',async()=>{
 for(const responder of [()=>({ok:true,headers:{get:()=> 'text/html'}}),()=>json({ok:false,code:'JOIN_CLOSED'}),()=>{throw Error('network');}]){const h=harness(responder);await assert.rejects(()=>h.api.submitToSheet(false,contact,'request-1'));assert.equal(h.authCalls(),0);}
});
test('configuration uses join deployment and authenticated session',async()=>{
 const registration={open:true,enabled:true,limit:40,count:1,remaining:39};const h=harness(()=>json({ok:true,registration}));await h.api.configureRegistration(true,40);assert.equal(h.authCalls(),1);assert.match(h.calls[0].url,/AKfycbxvckZM/);const body=JSON.parse(h.calls[0].options.body);assert.equal(body.accessToken,'test-session');assert.equal(body.action,'configure');
});
