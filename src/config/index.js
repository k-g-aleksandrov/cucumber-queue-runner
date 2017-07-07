import nconf from 'nconf';

nconf.argv().env().file({ file: process.env.CONFIG_FILE });

module.exports = nconf;
