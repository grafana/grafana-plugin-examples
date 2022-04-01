module.exports = (on, config) => {
  // making sure we use the same color profile regardless where we run
  // the tests.
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      launchOptions.args.push('--force-color-profile=srgb');
    }
  });
};
