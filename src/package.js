import assign from "lodash/object/assign";
import co from "co";
import { EventEmitter } from "events";
import { getJSON } from "./utils";
import pick from "lodash/object/pick";
import semver from "semver";

class Package extends EventEmitter {
  constructor (config) {
    super();

    // Init params
    this._initialized = false;
    if (config)
      this.init(config);

    // Check package on load
    this.on("init", () => {
      if (!this.isValid())
        throw new Error("Invalid package");
    });
  }

  init (config) {
    // Don't allow multiple initializations
    if (this._initialized)
      throw new Error("Package already initialized");

    // Load props
    this._keys = Object.keys(config);
    assign(this, config);

    // Emit event
    this._initialized = true;
    this.emit("init", config);
    return this;
  }

  isValid () {
    return (
      !!this.name &&
      this.version &&
      semver.valid(this.version)
    );
  }

  load (url) {
    return co(this._load.bind(this, url))
      .then(this.init.bind(this));
  }

  toJSON () {
    // Return a POJO containing current package config
    return pick(this, this._keys);
  }

  // Private methods
  *_load (url) {
    let
      pkg = yield getJSON(url);

    // Init package
    this.emit("load", pkg);
    return pkg;
  }
}

export default Package;
