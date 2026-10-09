import content from '../content/site/imageAlts.json';
export default Object.fromEntries(content.entries.map(entry=>[entry.image,{es:entry.es,en:entry.en}]));
