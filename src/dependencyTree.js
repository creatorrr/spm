import assign from "lodash/object/assign";
import Arboreal from "arboreal";
import co from "co";
import { EventEmitter } from "events";
import filter from "lodash/collection/filter";
import findIndex from "lodash/array/filter";
import forEach from "lodash/collection/forEach";
import { findSatisfactoryVersion, getVersions } from "./utils";
import mapValues from "lodash/object/mapValues";
import pairs from "lodash/object/pairs";
import sortBy from "lodash/collection/sortBy";

import Package from "./package";

const mkDependencyTree = (registries=[]) => {
  class DependencyTree extends Arboreal {
    constructor (parent, root, id) {
      // Set ID
      id = (parent ? parent.id + '/' : "") +
        id || `node_modules/${ root.name }`;

      super(parent, root, id);

      // Build tree
      this.buildTree();
    }

    buildTree () {
      return co(this._buildTree.bind(this))
        .then(this.emit.bind(this, "build"));
    }

    *_buildTree () {
      let deps = yield this._loadDependencies();
      forEach(deps, this.appendChild);

      return this;
    }

    *_loadDependencies () {
      let
        {dependencies} = this.data,
        {_loadDependency} = this,

        // Make _loadDependency accept arrays
        loader = _loadDependency.apply.bind(_loadDependency, this),
        loaded = yield map(
          pairs(dependencies),
          loader
        );

      return loaded;
    }

    *_loadDependency (name, condition) {
      let
        allMatches = yield getVersions(name, registries),
        versionMap = mapValues(allMatches, Object.keys),

        candidates = filter(
          mapValues(
            allMatches, findSatisfactoryVersion.bind(null, condition)
          )
        ),

        versions = sortBy(
          pairs(candidates),
          ([registry]) => findIndex(registries, registry)
        ),

        [registry, version] = versions.length ? versions : [];

      // Load package
      if (version) {
        let
          config = allMatches[registry][version],
          pkg = yield new Package(config);

        return pkg;
      }

      else
        throw new Error(`No versions available for ${ condition }`);
    }
  };

  return assign(DependencyTree.prototype, EventEmitter.prototype);
};

export default mkDependencyTree;
