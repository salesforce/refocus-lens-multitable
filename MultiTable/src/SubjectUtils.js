'use strict';

module.exports = class SubjectUtils {

  static isUnderRootSubject(subject, rootSubject) {
    return subject.absolutePath.toLowerCase()
      .indexOf(rootSubject.toLowerCase()) === 0;
  }

} // module.exports
