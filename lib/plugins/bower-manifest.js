import processJSON from './helper/process-json';
import { isSemver } from './helper/version';
import { javascriptFile } from './javascript';
import { jsonRegExKeyValue, jsonRegExValue } from './helper/regex-builder';
import insertLink from '../insert-link';
import liveResolverQuery from '../resolver/live-resolver-query.js';
import gitUrl from '../resolver/git-url.js';
import githubShorthand from '../resolver/github-shorthand.js';

function linkDependency(type, blob, key, value) {
  const isValidSemver = isSemver(value);
  const regex = jsonRegExKeyValue(key, value);

  insertLink(blob.el, regex, {
    pluginName: 'BowerManifest',
    target: isValidSemver ? '$1' : '$2',
    type: isValidSemver ? 'liveResolverQuery' : 'git',
  });
}

function linkFile(blob, key, value) {
  const regex = jsonRegExValue(key, value);

  insertLink(blob.el, regex, {
    pluginName: 'BowerManifest',
    type: 'file',
    path: blob.path,
    target: '$1',
  });
}

export default class BowerManifest {

  static resolve({ target, path, type }) {
    if (type === 'file') {
      return javascriptFile({ target, path });
    }

    if (type === 'liveResolverQuery') {
      return liveResolverQuery({ type: 'bower', target });
    }

    return [
      gitUrl({ target }),
      githubShorthand({ target }),
    ];
  }

  getPattern() {
    return ['/bower.json$'];
  }

  parseBlob(blob) {
    processJSON(blob, {
      '$.dependencies': linkDependency.bind(null, this.registryType),
      '$.devDependencies': linkDependency.bind(null, this.registryType),
      '$.resolutions': linkDependency.bind(null, this.registryType),
      '$.main': linkFile,
    });
  }
}
