import assign from "lodash/object/assign";
import Arboreal from "arboreal";
import co from "co";
import { EventEmitter } from "events";
import findIndex from "lodash/array/findIndex";
import forEach from "lodash/collection/forEach";
import { findSatisfactoryVersion, getVersions } from "./utils";
import map from "lodash/collection/map";
import mapValues from "lodash/object/mapValues";
import pairs from "lodash/object/pairs";
import sortBy from "lodash/collection/sortBy";

import Package from "./package";

const mkDependencyTree = (registries=[]) => {
  class DependencyTree extends Arboreal {
    constructor (parent, root, id) {
      // Set ID
      id = DependencyTree.genId(root, parent);
      super(parent, root, id);

      // Create promise
      this._promise = new Promise((resolve, reject) => {
        this.on("load", resolve);
        this.on("error", reject);
      });

      // Build tree
      this._built = false;
      if (root)
        this.buildTree();
    }

    // Public methods
    buildTree () {
      if (this._built)
        throw new Error("Tree already built");

      return co(this._loadDependencies.bind(this))
        .then(deps => forEach(deps, this.appendChild.bind(this)))
        .then(() => this._built = true)
        .then(this.emit.bind(this, "build"))
        .catch(this.emit.bind(this, "error"));
    }

    promise () {
      return this._promise;
    }

    // Private methods
    *_loadDependencies () {
      let
        {dependencies} = this.data,
        {loadDependency} = this.constructor,

        // Make loadDependency accept arrays
        loader = loadDependency.apply.bind(loadDependency, null),
        loaded = yield map(
          pairs(dependencies),
          loader
        );

      return loaded;
    }

    // Static methods
    static genId ({name}, parent) {
      let generated = "";

      if (name)
        generated = `node_modules/${ name }`;

      return parent ? `${ parent.id }/${ generated }` : generated;
    }

    static *loadDependency (name, condition) {
      let
        allMatches = yield getVersions(name, registries),
        versionMap = mapValues(allMatches, Object.keys),

        candidates = mapValues(
          versionMap, findSatisfactoryVersion.bind(null, condition)
        ),

        versions = sortBy(
          pairs(candidates),
          ([registry]) => findIndex(registries, registry)
        ),

        [registry, version] = versions.length ? versions[0] : [];

      // Load package
      if (version) {
        let
          config = allMatches[registry][version],
          pkg = new Package(config);

        return pkg;
      }

      else
        throw new Error(`No versions available for ${ condition }`);
    }
  };

  // Mixin EventEmitter
  assign(DependencyTree.prototype, EventEmitter.prototype);

  return DependencyTree;
};

export default mkDependencyTree;
