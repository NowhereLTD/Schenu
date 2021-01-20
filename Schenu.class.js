/**
 * Schenu - Is a javascript based template engine.
 */
class Schenu {
  constructor(server) {
    this.server = server;
    this.server.Schenu = this;
  }

  /**
   * parse - Parse a schenu template to html
   *
   * @param {String} text The template string
   * @param {Object} args Unlimited arguments
   *
   * @returns {String} The parsed template
   */
  parse(text, ...args) {
    return text;
  }
}
