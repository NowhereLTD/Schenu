/**
 * Schenu - Is a javascript based template engine.
 */
export class Schenu {
  constructor() {
    this.parseTimeout = 100;
    this.extensions = {};
  }

  /**
   * parse - Parse a schenu template to html
   *
   * @param {String} text The template string
   * @param {Object} args Unlimited arguments
   *
   * @returns {String} The parsed template
   */
  static async parse(text, args = {}, errorBreak = false) {
    return new Promise((resolve, error) => {
      let modulePath = Deno.mainModule.replace("file://", "");
      modulePath = modulePath.substr(0, modulePath.lastIndexOf("/"));
      const tmpFileName = modulePath + "/tmpSchenuWorker" + Date.now() + Math.round(Math.random() * 100000) + ".js";

      const regexLineBreaks = new RegExp(/\n/, "g");
      const regexText = new RegExp(/\#\#([^#]*)\#\#/, "g");
      const regexVars = new RegExp(/\$([^$]*)\$/, "g");
      const regexFunctions = new RegExp(/\~([^(]*)\(([^)]*)\)/, "g");

      let replaceText = text.replaceAll(regexLineBreaks, "");

      for(let key in args) {
        replaceText = "let " + key + " = " + JSON.stringify(args[key]) + ";" + replaceText;
      }

      /**
       * Replace template variables
       */
      replaceText = replaceText.replaceAll(regexVars, function(match, variable) {
        let replacement = "' + " + variable + " + '";
        return replacement;
      });


      /**
       * Support extension functions
       */
      replaceText = replaceText.replaceAll(regexFunctions, function(match, name, args) {
        if(this.extensions[name] != null) {
          let extendedString = this.extensions[name](args);
          return extendedString;
        } else {
          return match;
        }
      }.bind(this));

      replaceText = replaceText.replaceAll(regexText, ";endText = endText + '$1';");

      replaceText = ";let endText = '';" + replaceText + ";postMessage(endText);";
      let encoder = new TextEncoder();
      Deno.writeFileSync(tmpFileName, encoder.encode(replaceText));


      let worker = new Worker(new URL(tmpFileName, Deno.mainModule).href, { type: "module" });
      let timeoutId = setTimeout(() => {
        worker.terminate();
        Deno.removeSync(tmpFileName);
        if(errorBreak) {
          error("Worker timed out!");
        } else {
          resolve("");
        }
      }, this.parseTimeout);

      worker.onmessage = ({data}) => {
        clearTimeout(timeoutId);
        let parsedText = data;
        worker.terminate();
        Deno.removeSync(tmpFileName);
        resolve(parsedText);
      }
    });
  }
}
