import official from './official.json';
export const t=(es:string,en:string)=>({es,en});
export const tours=official.tours;
// Publish only client-approved articles and verified Google reviews.
export const posts: {slug:string;image:string;category:{es:string;en:string};title:{es:string;en:string};intro:{es:string;en:string};body:{es:string;en:string}}[]=[];
export const reasons=official.reasons;
export const reviewsArePlaceholders=false;
export const reviews: {name:string;rating:number;date:string;url:string;body:{es:string;en:string};origin:{es:string;en:string};tour:{es:string;en:string}}[]=[];
