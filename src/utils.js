import filter from "lodash/collection/filter";
import last from "lodash/array/last";
import map from "lodash/collection/map";
import oboe from "oboe";
import reduce from "lodash/collection/reduce";
import semver from "semver";
import sort from "lodash/collection/sortBy";
import zipObject from "lodash/array/zipObject";

const
  removeTrailingSlash = str => str[str.length-1] == '/' ? str.slice(0,str.length-1) : str,
  getPath = (obj, path) => {
    let
      p = removeTrailingSlash(path),
      separator = '/',
      keys = p.split(separator),

      // Get reference to deepest key
      value = reduce(
        keys,
        (get, key) => get[key],
        obj);

    return value;
  },

  setPath = (obj, path, value) => {
    let
      p = removeTrailingSlash(path),
      separator = '/',
      keys = p.split(separator),

      // Get reference to second deepest key
      setter = reduce(
        keys.slice(0, keys.length-1),
        (set, key) => set[key],
        obj),

      // Get deepest key
      key = last(keys);

    // Set value
    setter[key] = value;
    return obj;
  },

  getJSON = url => {
    return new Promise((resolve, reject) => {
      oboe(url)
        .done(resolve)
        .fail(reject);
    });
  },

  getJSONProp = (url, prop) => {
    return new Promise((resolve, reject) => {
      let found = false;

      oboe(url)
        .node(prop, value => {
          found = true;
          resolve(value);

          // Found value; hang up
          this.abort();
        })
        .done(() => {
          if (!found)
            reject(new Error(`Property ${ prop } not found`));
        })
        .fail(reject);
    });
  },

  flip = f =>
    (a, b) => f(b, a),

  checkVersion = flip(semver.satisfies),

  findSatisfactoryVersion = (condition, versions=[]) => {
    let
      candidates = filter(
        versions,
        checkVersion.bind(null, condition)
      ),
      highestVersion = reduce(
        sort(candidates),
        (v1, v2) => semver.gt(v1, v2) ? v1 : v2
      );

    return highestVersion;
  },

  getVersions = function* (pkgName, registries=[]) {
    let
      versions = map(registries, registry =>
        getJSONProp(`${ registry }/${ pkgName }`, "versions")
      );

    return yield zipObject(registries, versions);
  };

export {
  checkVersion,
  findSatisfactoryVersion,
  flip,
  getJSON,
  getJSONProp,
  getVersions,
  getPath,
  removeTrailingSlash,
  setPath
};
