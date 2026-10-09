import content from '../content/site/interface.json';
export const interfaceCopy=Object.fromEntries(content.entries.map(entry=>[entry.key,{es:entry.es,en:entry.en}]));
