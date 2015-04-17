import State from "ampersand-state";

const
  Config = State.extend({
    props: {
      // Globals
      CONFIG_FILE: {
        type: "string",
        default: "package.json",
        required: true,

        // Immutable
        setOnce: true
      },

      registries: {
        type: "array",
        default: () => []
      }
    }
  });

export default Config;
