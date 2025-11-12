module.exports = {
  default: {
    formatOptions: {
      snippetInterface: 'async-await',
    },
    paths: ['tests/**/*.feature'],
    require: ['tests/**/*.steps.ts'],
    format: ['progress'],
    parallel: 1,
  },
};
