// Setting this to true makes end-to-end tests execute much quicker
// which is useful during iterative development
const devMode = 0;

let devUtils = {
  transitionIfNotDev(transition) {
    return devMode ? "none" : transition;
  },
  devMode,
};

module.exports = devUtils;
