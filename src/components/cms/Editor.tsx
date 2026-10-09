import {useEffect} from 'react';
import {makePage} from '@keystatic/astro/ui';
import config from '../../../keystatic.config';
const Keystatic=makePage(config);
export default function Editor(){
  useEffect(()=>{
    // Keystatic handles editor routes internally; the overview is an Astro page.
    const overview=(event:MouseEvent)=>{
      const link=(event.target as Element)?.closest?.('a');
      if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const url=new URL(link.href);
      if(url.origin===location.origin&&url.pathname.replace(/\/$/,'')==='/keystatic'){
        event.preventDefault();event.stopPropagation();location.assign('/admin/');
      }
    };
    document.addEventListener('click',overview,true);
    return()=>document.removeEventListener('click',overview,true);
  },[]);
  return <div className="studio-editor-layout"><div className="studio-toolbar"><a href="/admin/">Volver al panel GOXO</a><span>Edición local · Guarda antes de salir</span><div className="studio-toolbar-actions"><a href="/cms/blog-preview/" target="_blank" rel="noreferrer">Previsualizar blog</a><a className="studio-site-link" href="/" target="_blank" rel="noreferrer">Ver sitio</a></div></div><Keystatic /></div>;
}
