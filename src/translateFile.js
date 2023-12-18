import { pipeline, env } from "@xenova/transformers";
import { readFile, writeJsonFile } from "./fileOp.js";
import color from 'colors-cli'
import cliProgress from 'cli-progress';

// create a new progress bar instance and use shades_classic theme
const translateBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);


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


let fileContent = readFile('/../sv.json')
let newObject = {};
let obj = {
  linesTranslated: 0,
  keysNotTranslated: []
}

console.time()
translateBar.start(Object.keys(fileContent).length, 0);
for (const [key, value] of Object.entries(fileContent)) {
    if (typeof value === 'object' && value !== null) {
      obj.keysNotTranslated.push(key)
      let nestedObject = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        let txt = await translation(nestedValue);
        nestedObject[nestedKey] = txt[0].translation_text;
        obj.linesTranslated++
      }
      newObject[key] = nestedObject;
    } else {
      let txt = await translation(value);
      newObject[key] = txt[0].translation_text;
      obj.linesTranslated++
    }
    translateBar.update(obj.linesTranslated);
};

translateBar.stop();

writeJsonFile('/../en.json', newObject)

console.timeEnd();

console.log( color.green(`Lines translated ${obj.linesTranslated}`) )
console.log( color.blue(`Nested object ${obj.keysNotTranslated.length}`) )