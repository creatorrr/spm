import oboe from "oboe";

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
  };

export {
  getJSON,
  getJSONProp
};
