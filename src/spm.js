import co from "co";
import { EventEmitter } from "events";

import Config from "./config";
import { getJSONProp, getVersions } from "./utils";
import Package from "./package";

class SPM extends EventEmitter {
  constructor (config={}) {
    super();

    this.config = new Config(config);
    this._currentPackage = new Package;

    // Forward load event
    this._currentPackage.on("load", this.emit.bind(this, "load"));
  }

  // Getters & setters
  get currentPackage () {
    return this._currentPackage.toJSON();
  }

  // Public methods
  getVersions (pkgName) {
    if (!pkgName)
      throw new Error("No package name passed");

    return co(
      getVersions.bind(null, pkgName, this.config.registries)

    ).catch(
      this.emit.bind(this, "error")
    );
  }

  load (rootUrl="") {
    let
      {CONFIG_FILE} = this.config,
      url = `${ rootUrl }/${ CONFIG_FILE }`;

    return this._currentPackage.load(url)
      .catch(
        this.emit.bind(this, "error")
      );
  }
}

export default SPM;
