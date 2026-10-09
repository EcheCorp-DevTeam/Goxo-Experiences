import {useState,useEffect,useRef} from 'react';
import type {BlogPost} from '../../data/articles';
import {blogStats} from '../../data/blog-render.mjs';
export default function BlogPreview({posts,initialSlug}:{posts:BlogPost[];initialSlug:string|null}){
  const [slug,setSlug]=useState(initialSlug||posts[0]?.slug||'');
  const [lang,setLang]=useState<'es'|'en'>('es');
  const [device,setDevice]=useState('desktop');
  const [loading,setLoading]=useState(true);
  const [scale,setScale]=useState(1);
  const frameRef=useRef<HTMLDivElement>(null);
  const width=device==='mobile'?390:device==='tablet'?768:1280;
  useEffect(()=>{
    if(!frameRef.current)return;
    const observer=new ResizeObserver(([entry])=>setScale(Math.min(1,entry.contentRect.width/width)));
    observer.observe(frameRef.current);
    return()=>observer.disconnect();
  },[width]);
  const post=posts.find(post=>post.slug===slug)||posts[0];
  const change=()=>setLoading(true);
  if(!post)return <main className="preview-empty"><h1>Aún no hay artículos guardados</h1><p>Crea un artículo y guárdalo como borrador para revisar aquí su diseño en móvil y escritorio.</p><a href="/keystatic/collection/articles/create">Crear artículo</a><a href="/admin/">Volver al panel</a></main>;
  const stats=blogStats(post.body[lang]);
  const title=post.seoTitle?.[lang]||`${post.title[lang]||'Título pendiente'} | GOXO`;
  const description=post.seoDescription?.[lang]||post.intro[lang];
  return <>
    <header className="preview-header"><div><a href="/keystatic/collection/articles">Volver al blog</a><h1>Previsualización del artículo</h1></div><button onClick={()=>location.reload()}>Actualizar desde el CMS</button></header>
    <div className="preview-controls"><label>Artículo<select value={post.slug} onChange={e=>{change();setSlug(e.target.value)}}>{posts.map(post=><option key={post.slug} value={post.slug}>{post.entry||post.title.es||post.slug}</option>)}</select></label><fieldset><legend>Idioma</legend><button aria-pressed={lang==='es'} onClick={()=>{if(lang!=='es'){change();setLang('es')}}}>Español</button><button aria-pressed={lang==='en'} onClick={()=>{if(lang!=='en'){change();setLang('en')}}}>English</button></fieldset><fieldset><legend>Vista</legend><button aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}>Escritorio</button><button aria-pressed={device==='tablet'} onClick={()=>setDevice('tablet')}>Tablet</button><button aria-pressed={device==='mobile'} onClick={()=>setDevice('mobile')}>Móvil</button></fieldset><span className={`preview-status ${post.published?'published':''}`}>{post.published?'Publicado en local':'Borrador'}</span></div>
    <p className="preview-notice">Muestra la última versión guardada. Guarda en el CMS y pulsa «Actualizar desde el CMS» para revisar nuevos cambios.</p>
    <main className="preview-layout"><section className="preview-canvas" aria-label="Vista del artículo"><div ref={frameRef} className={`preview-frame ${device}`} style={{width}}><span className="preview-loading" role="status">{loading?'Cargando vista previa…':''}</span><iframe key={`${post.slug}-${lang}`} src={`${lang==='es'?'/es':''}/cms/article-preview?slug=${encodeURIComponent(post.slug)}`} style={{width,height:`${100/scale}%`,transform:`scale(${scale})`,transformOrigin:'top left'}} title={`Artículo en ${lang==='es'?'español':'inglés'}`} onLoad={()=>setLoading(false)}/></div></section>
      <aside className="preview-inspector"><section><h2>Lectura</h2><p>{stats.words} palabras · {stats.minutes} min de lectura</p><h3>Estructura</h3>{stats.headings.length?<ul>{stats.headings.map((heading,i)=><li key={i}>{heading}</li>)}</ul>:<p>Añade subtítulos para facilitar la lectura.</p>}</section><section><h2>Vista en buscadores</h2><p className="seo-preview-path">/journal/{post.slug}/</p><h3 className="seo-preview-title">{title}</h3><p>{description}</p><dl><dt>Título</dt><dd>{title.length} caracteres</dd><dt>Descripción</dt><dd>{description.length} caracteres</dd></dl><p className="inspector-note">Simulación orientativa. Los buscadores pueden mostrar otro texto.</p></section><section><h2>Comprobar antes de publicar</h2><ul className="preview-checks"><li>{post.title.es&&post.title.en?'Títulos en ambos idiomas':'Falta algún título traducido'}</li><li>{post.body.es&&post.body.en?'Contenido en ambos idiomas':'Falta contenido en algún idioma'}</li><li>{post.image?'Portada añadida':'Sin imagen de portada'}</li><li>{post.imageAlt?.es&&post.imageAlt?.en?'Descripción accesible de portada':'Revisa las descripciones de la portada'}</li></ul><a className="preview-edit" href={`/keystatic/collection/articles/item/${post.slug}`}>Editar este artículo</a></section></aside>
    </main>
  </>;
}
