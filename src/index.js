import { pipeline, env } from "@xenova/transformers";
import Parser from 'rss-parser';
let parser = new Parser();

const rssUrl  = 'https://bloggar.aftonbladet.se/sillyseason/feed/  '

class MyTranslationPipeline {
  static task = 'translation';
  static model = 'Xenova/nllb-200-distilled-600M';
  static instance = null;

  static async getInstance(progress_callback = null) {
      if (this.instance === null) {
          env.cacheDir = './.cache';
          this.instance = pipeline(this.task, this.model, { progress_callback });
      }

      return this.instance;
  }
}

const translation = async (text)  => {  
  const translator = await MyTranslationPipeline.getInstance();
  let output = await translator(text, {
    src_lang: 'swe_Latn', // Swedish
    tgt_lang: 'eng_Latn', // English
  });
  output.orgtxt = text;
  return output;
}


let feed = await parser.parseURL(rssUrl);
console.log(feed.title);a

feed.items.forEach(async item => {
  console.log(await translation(item.title));
});
