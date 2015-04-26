import request from "request";
import rewire from "rewire";

const SPM = rewire("../src/spm");

export default function testSPM ({done, expect, ok}) {
  expect(1);

  // Mock module
  SPM.__set__({
    fetch: request,
    caches: {
      open () {
        return {
          put: () => {}
        }
      }
    }
  });

  let
    spm = new SPM;

  ok(spm);
  done();
}
