import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, addDoc, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Content, ContentCollection, Settings } from './model';
const config = {apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,appId:import.meta.env.VITE_FIREBASE_APP_ID};
export const configured = Object.values(config).every(Boolean);
let services: ReturnType<typeof initializeServices> | undefined;
function initializeServices() { const app=getApps()[0] || initializeApp(config); return {auth:getAuth(app),db:getFirestore(app),storage:getStorage(app)}; }
export function firebase() { if (!configured) throw new Error('Firebase is not configured'); services ??= initializeServices(); return services; }
export function watchContent(name: ContentCollection, next: (rows: Content[])=>void, fail: (error: Error)=>void) {return onSnapshot(query(collection(firebase().db,name),orderBy('updatedAt','desc')), snap=>next(snap.docs.map(d=>({...d.data(),id:d.id}) as Content)),fail);}
export async function saveContent(name: ContentCollection, value: Omit<Content,'id'>, id?: string) {const {db,auth}=firebase(); if(!auth.currentUser) throw new Error('Sign in required'); const target=id?doc(db,name,id):doc(collection(db,name)); await setDoc(target,{...value,updatedBy:auth.currentUser.uid,updatedAt:serverTimestamp()});}
export async function removeContent(name: ContentCollection,id: string) {await deleteDoc(doc(firebase().db,name,id));}
export async function submitForm(name:'joinRequests'|'contactMessages',data:Record<string,string>) {await addDoc(collection(firebase().db,name),{...data,submittedAt:serverTimestamp(),...(name==='joinRequests'?{status:'new'}:{isRead:false})});}
export async function saveSettings(settings:Settings) {await setDoc(doc(firebase().db,'settings','public'),settings);}
export async function uploadImage(file: File) {if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024) throw new Error('Use JPG, PNG or WebP up to 5 MB'); const {auth,storage}=firebase(); if(!auth.currentUser) throw new Error('Sign in required'); const target=ref(storage,`content/${auth.currentUser.uid}/${crypto.randomUUID()}`); await uploadBytes(target,file,{contentType:file.type}); return getDownloadURL(target);}
