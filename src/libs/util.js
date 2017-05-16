import fs from 'fs';
const log = require('libs/log')(module);

module.exports.isGitUrl = function isGitUrl(str) {
  const re = /(?:git|ssh|https?|git@[\w.]+):(?:\/\/)?[\w.@:\/~_-]+\.git(?:\/?|#[\d\w.\-_]+?)$/;

  return re.test(str);
};

module.exports.generateGUID = function generateGUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

module.exports.scanRepository = function scanRepository(dir, done) {
  let results = [];

  fs.readdir(dir, (err, list) => {
    if (err) {
      return done(err);
    }
    let i = 0;

    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = `${dir}/${file}`;
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          scanRepository(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.indexOf('src') > -1 && file.endsWith('.feature')) {
            results.push(file);
          }
          return next();
        }
      });
    })();
  });
};

module.exports.removeDirectory = (dirPath, removeSelf = true) => {
  let files;

  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const filePath = `${dirPath}/${files[i]}`;

      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        this.removeDirectory(filePath);
      }
    }
  }
  if (removeSelf) {
    fs.rmdirSync(dirPath);
  }
};

module.exports.zipDirectory = (dir, name) => {
  const execFileSync = require('child_process').execFileSync;

  execFileSync('zip', ['-r', '-j', name, dir]);
};

module.exports.shuffleArray = function shuffleArray(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};
