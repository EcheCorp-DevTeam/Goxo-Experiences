import {normalizeBlog} from './blog-render.mjs';
export type BlogPost={slug:string;entry?:string;published:boolean;image:string;imageAlt?:{es:string;en:string};category:{es:string;en:string};title:{es:string;en:string};intro:{es:string;en:string};body:{es:string;en:string};seoTitle?:{es:string;en:string};seoDescription?:{es:string;en:string}};
const files=import.meta.glob<{default:Omit<BlogPost,'slug'>}>('../content/articles/*.json',{eager:true});
export const allPosts:BlogPost[]=Object.entries(files).map(([path,module])=>normalizeBlog({...module.default,slug:path.split('/').pop()!.replace(/\.json$/,'')}));
export const posts=allPosts.filter(post=>post.published);
