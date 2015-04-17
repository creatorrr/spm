import assign from "lodash/object/assign";
import pick from "lodash/object/pick";
import semver from "semver";

class Package {
  constructor (config={}) {
    // Load props
    this._keys = Object.keys(config);
    assign(this, config);

    if (!this.isValid())
      throw new Error("Invalid package");
  }

  isValid () {
    return (
      !!this.name &&
      this.version &&
      semver.valid(this.version)
    );
  }

  toJSON () {
    // Return a POJO containing current package config
    return pick(this, this._keys);
  }
}

export default Package;
