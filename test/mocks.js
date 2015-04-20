import fs from "fs";
import oboe from "oboe";

const
  mockOboe = (url, ...rest) => {
    let
      mockData = fs.createReadStream("./test/data.json");

    return oboe(mockData, ...rest);
  };

export {
  mockOboe
};
