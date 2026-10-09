import Markdoc from '@markdoc/markdoc';
const safeLink=value=>typeof value==='string'&&(/^(https?:\/\/|mailto:|tel:|#)/i.test(value)||/^\/(?!\/)/.test(value))?value:'#';
const safeImage=value=>typeof value==='string'&&(/^https:\/\//i.test(value)||/^\/media\/(?!.*(?:\.\.|\.svg(?:$|[?#])))/i.test(value))?value:'';
export function normalizeBlog(post){
 const value={...post,image:post.image||'',published:post.published===true};
 for(const key of ['title','intro','category','body','imageAlt','seoTitle','seoDescription'])value[key]={es:post[key]?.es||'',en:post[key]?.en||''};
 return value;
}
export function renderBlog(source=''){
  const ast=Markdoc.parse(source);
  for(const node of ast.walk()){
    if(node.type==='link')node.attributes.href=safeLink(node.attributes.href);
    if(node.type==='image')node.attributes.src=safeImage(node.attributes.src);
    if(node.type==='heading'&&node.attributes.level===1)node.attributes.level=2;
  }
  const content=Markdoc.transform(ast);
  return Markdoc.renderers.html(content);
}
export function blogStats(source=''){
  const ast=Markdoc.parse(source),text=[],headings=[];
  for(const node of ast.walk()){
    if(node.type==='text')text.push(node.attributes.content||'');
    if(node.type==='heading')headings.push(node.children.flatMap(child=>[...child.walk()].filter(n=>n.type==='text').map(n=>n.attributes.content)).join(''));
  }
  const words=text.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return{words,minutes:Math.max(1,Math.ceil(words/200)),headings};
}
