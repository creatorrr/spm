import tar from "tar";
import zlib from "browserify-zlib";

import { setPath } from "./utils";

const
  extract = tgz => {
    let
      unzipper = new zlib.Gunzip(),
      untar = new tar.Parse(),
      result = {},
      promise = new Promise((resolve, reject) => {
        // Reject on error
        unzipper.on("error", reject);
        untar.on("error", reject);

        // Resolve on end
        untar.on("end", resolve.bind(promise, result));

        // Add entries to result
        untar.on("entry", entry => {
          if (!entry.type) return;

          // Else add entry to result
          setPath(
            result,
            entry.path,
            entry.type.match(/^directory/i) ? {} : entry
          );
        });
      });

    // Run
    tgz.pipe(unzipper).pipe(untar);

    return promise;
  };

export default extract;
