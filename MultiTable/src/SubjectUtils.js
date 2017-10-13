/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * ./Multitable/src/SubjectUtils.js
 *
 * Utility functions for subjects.
 */
'use strict';

module.exports = class SubjectUtils {

  static isUnderRootSubject(subject, rootSubject) {
    return subject.absolutePath.toLowerCase()
      .indexOf(rootSubject.toLowerCase()) === 0;
  }

} // module.exports
