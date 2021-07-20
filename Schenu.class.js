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
      let tmpFileName = modulePath + "/tmpSchenuWorker" + Math.round(Math.random() * 100000) + ".js";

      let regexLineBreaks = new RegExp(/\n/, "g");
      let regexText = new RegExp(/\#\#([^#]*)\#\#/, "g");
      let regexVars = new RegExp(/\$([^$]*)\$/, "g");
      let regexFunctions = new RegExp(/\~([^(]*)\(([^)]*)\)/, "g");

      let replaceText = text.replaceAll(regexLineBreaks, "");

      /**
       * Replace template variables
       */
      replaceText = replaceText.replaceAll(regexVars, function(match, variable) {
        let replacement = "' + " + variable + " + '";
        if(args[variable] != null) {
          replacement = args[variable];
        }
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


      let worker = new Worker(new URL(tmpFileName, import.meta.url).href, { type: "module" });
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
