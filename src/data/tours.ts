import official from './official';
export {posts} from './articles';
import verified from '../content/site/verifiedReviews.json';
export const t=(es:string,en:string)=>({es,en});
export const tours=official.tours.filter(tour=>tour.published);
// Publish only client-approved articles and verified Google reviews.
export const reasons=official.reasons;
export const reviewsArePlaceholders=false;
export const reviews: {name:string;rating:number;date:string;url:string;body:{es:string;en:string};origin:{es:string;en:string};tour:{es:string;en:string}}[]=verified.reviews.filter((review:any)=>review.name&&review.url&&review.rating>=1&&review.rating<=5);
