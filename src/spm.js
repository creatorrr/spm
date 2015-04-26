// Polyfills
if (typeof self !== "undefined") require("whatwg-fetch");
if (typeof Cache !== "undefined") require("serviceworker-cache-polyfill");

import co from "co";
import { EventEmitter } from "events";
import traverse from "traverse";

import Config from "./config";
import extract from "./extract";
import { getJSONProp, getVersions } from "./utils";
import { mkDependencyTree } from "./dependencyTree";
import Package from "./package";

class SPM extends EventEmitter {
  constructor (config={}) {
    super();

    this.config = new Config(config);
    this._currentPackage = new Package;

    this.cache = caches.open("node_modules");

    // Forward load event
    this._currentPackage.on("load", this.emit.bind(this, "load"));
  }

  // Private methods
  _buildDependencyTree (pkg) {
    let
      DependencyTree = mkDependencyTree(this.config.get("registries")),
      tree = new DependencyTree(null, pkg || this.currentPackage);

    return tree.promise();
  }

  *_loadTarball (url) {
    let
      tgz = yield fetch(url),
      extracted = yield extract(tgz);

    return extracted;
  }

  _saveDependency (module) {
    let
      depTree = traverse(module),
      promises = [];

    // Save to cache
    depTree.forEach(entry =>
      promises.push(co(this._cacheEntry.bind(this, entry)))
    );

    return promises;
  }

  *_cacheEntry (entry) {
    if (!entry.type.match(/^file/i))
      return false;

    let
      data = [],
      cache = yield this.cache,
      chunk, blob;

    // Read stream
    while (chunk = yield read(entry))
      data.push(chunk);

    // Write to cache
    blob = new Blob(data);
    return cache.put(entry.path, new Response(blob));
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
