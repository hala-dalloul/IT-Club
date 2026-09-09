import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc,onSnapshot } from 'firebase/firestore';
import { collections,emptySettings,type Content,type ContentCollection,type Lang,type Settings } from '@/lib/club/model';
import { configured,firebase,watchContent } from '@/lib/club/firebase';
const emptyData:Record<ContentCollection,Content[]>={projects:[],members:[],events:[],achievements:[],partners:[]};
const Context=createContext({lang:'ar' as Lang,setLang:(_lang:Lang)=>{},data:emptyData,settings:emptySettings,loading:false,error:false});
export function ClubProvider({children}:{children:ReactNode}) {
 const [lang,setLang]=useState<Lang>('ar'); const [data,setData]=useState(emptyData); const [settings,setSettings]=useState<Settings>(emptySettings); const [loading,setLoading]=useState(configured);const [error,setError]=useState(false);
 useEffect(()=>{try{if(localStorage.getItem('ucas-language')==='en')setLang('en');}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';try{localStorage.setItem('ucas-language',lang);}catch{}},[lang]);
 useEffect(()=>{if(!configured)return;let pending=collections.length;const done=new Set<string>();const finish=(key:string)=>{if(!done.has(key)){done.add(key);pending--;if(!pending)setLoading(false);}};const stops=collections.map(name=>watchContent(name,rows=>{setData(prev=>({...prev,[name]:rows}));finish(name);},()=>{setError(true);finish(name);}));stops.push(onSnapshot(doc(firebase().db,'settings','public'),s=>{if(s.exists())setSettings({...emptySettings,...s.data()} as Settings);},()=>setError(true)));return()=>stops.forEach(stop=>stop());},[]);
 return <Context.Provider value={{lang,setLang,data,settings,loading,error}}>{children}</Context.Provider>;
}
export const useClub=()=>useContext(Context);
