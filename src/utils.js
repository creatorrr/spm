import filter from "lodash/collection/filter";
import map from "lodash/collection/map";
import oboe from "oboe";
import reduce from "lodash/collection/reduce";
import semver from "semver";
import sort from "lodash/collection/sortBy";
import zipObject from "lodash/array/zipObject";

const
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

  checkVersion = condition =>
    v => semver.satisfies(v, condition),

  findSatisfactoryVersion = (condition, versions=[]) => {
    let
      candidates = filter(versions, checkVersion(condition)),
      sorted = sort(candidates),
      highestVersion = reduce(sorted, (v1, v2) => semver.gt(v1, v2) ? v1 : v2);

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
  getJSON,
  getJSONProp,
  findSatisfactoryVersion,
  getVersions
};
