import co from "co";
import { EventEmitter } from "events";
import map from "lodash/collection/map";
import zipObject from "lodash/array/zipObject";

import Config from "./config";
import { getJSON, getJSONProp } from "./utils";
import Package from "./package";

class SPM extends EventEmitter {
  constructor (config={}) {
    super();

    this.config = new Config(config);
    this._currentPackage = null;
  }

  // Getters & setters
  get currentPackage () {
    if (this._currentPackage === null)
      throw Error("No package loaded");

    else
      return this._currentPackage.toJSON();
  }

  // Public methods
  getVersions (pkgName) {
    if (!pkgName)
      throw new Error("No package name passed");

    return co(
      this._getVersions.bind(this, pkgName)

    ).catch(
      this.emit.bind(this, "error")
    );
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

  // Private methods
  *_getVersions (pkgName) {
    let
      {registries} = this.config,
      versions = map(registries, registry => {
        return getJSONProp(`${ registry }/${ pkgName }`, "versions")
      });

    return yield zipObject(registries, versions);
  }

  *_loadPackage (rootUrl) {
    let
      {CONFIG_FILE} = this.config,
      url = `${ rootUrl }/${ CONFIG_FILE }`,
      pkg = yield getJSON(url);

    return pkg;
  }

  _setPackage (pkg) {
    this._currentPackage = new Package(pkg);
  }
}

export default SPM;
