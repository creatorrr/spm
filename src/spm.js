import co from "co";
import { EventEmitter } from "events";

import Package from "./package";
import { getJSON } from "./utils";

// GLOBALS
const
  CONFIG_FILE = "package.json";

class SPM extends EventEmitter {
  constructor (registries=[]) {
    super();

    this.registries = registries;
    this._currentPackage = null;
  }

  // Public methods
  get currentPackage () {
    if (this._currentPackage === null)
      throw Error("No package loaded");

    else
      return this._currentPackage.toJSON();
  }

  load (rootUrl="") {
    return co(
      this._loadPackage.bind(this, rootUrl)

    ).then(
      pkg => {
        this._setPackage(pkg);
        this.emit("load", pkg);
      }

    ).catch(
      this.emit.bind(this, "error")
    );
  }

  // Public methods
  _setPackage (pkg) {
    this._currentPackage = new Package(pkg);
  }

  *_loadPackage (rootUrl) {
    let
      url = `${ rootUrl }/${ CONFIG_FILE }`,
      pkg = yield getJSON(url);

    return pkg;
  }
}

export default SPM;
