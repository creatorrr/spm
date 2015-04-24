import co from "co";
import rewire from "rewire";

import testData from "./data2";
const mkDependencyTree = rewire("../src/dependencyTree");

export default function testDependencyTree ({done, equal, expect, ifError, ok}) {
  expect(5);

  let
    registries = ["http://registry.npmjs.org"],
    DependencyTree = mkDependencyTree(registries),
    {genId, loadDependency} = DependencyTree;

  // test genId
  let
    pkgName = "gaga",
    parentId = "node_modules/lady";

  equal(
    genId({name: pkgName}, {id: parentId}),
    `${ parentId }/node_modules/${ pkgName }`
  );

  // test loadDependency
  let testLoadDependency = co(
    loadDependency.bind(null, "co", "4.x")
  )
  .then(({name, version}) => {
    ok(name);
    ok(version.match(/^4\..+/i));
  })
  .catch(ifError);

  // test DependencyTree
  let testMain = (new DependencyTree(null, testData)).promise()
  .then(tree => {
    let
      firstChild = tree.children[0];

    // Children loaded?
    ok(tree.children.length);

    // ids set properly?
    equal(
      firstChild,
      tree.find(genId(firstChild.data, tree))
    );
  })
  .catch(ifError);

  // Wait for all tests to finish
  Promise.all([testLoadDependency, testMain])
    .then(() => done());
}
