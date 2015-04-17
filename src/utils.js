import oboe from "oboe";

const
  getJSON = url => {
    return new Promise((resolve, reject) => {
      oboe(url)
        .done(resolve)
        .fail(reject);
    });
  };

export {
  getJSON
};
