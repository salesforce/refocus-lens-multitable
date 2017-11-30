/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * ./MultiTable/src/Utils.js
 *
 * Some general helper functions.
 */
'use strict';

module.exports = class Utils {
  static inventory(subject) {
    const inv = {
      // has all the samples in the subject hierarchy keyed off of sample name
      samples: {},

      /*
       * has all the subjects keyed off of subject absolutepath. The entire
       * subject hierarchy, including the samples are part of each subject
       * TODO: Including the subject hierarchy for each of the subjects seems
       * unncecessary. Just include the subject and its samples here.
       */
      subjects: {},
    };
    if (subject.absolutePath) {

      // need deep copy to avoid modifying the input
      const _subj = JSON.parse(JSON.stringify(subject));
      delete _subj.children;
      inv.subjects[subject.absolutePath.toLowerCase()] = _subj;
      if (subject.samples && subject.samples.length) {
        subject.samples.forEach((sample) =>
          inv.samples[sample.name.toLowerCase()] = sample);
      }

      if (subject.children && subject.children.length) {
        subject.children.forEach((d) => {
          const childInv = Utils.inventory(d);
          // merge childInv.subject into inv.subjects
          Object.assign(inv.subjects, childInv.subjects);
          // merge childInv.samples into inv.samples
          Object.assign(inv.samples, childInv.samples);
        });
      }
    }

    return inv;
  } // inventory

  static sort(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  }
  /**
   * Use this sort function to sort an array of objects in ascending order by
   * name (not case sensitive).
   */
  static sortByNameAscending(a, b) {
    return Utils.sort(a.name.toLowerCase() || '', b.name.toLowerCase() || '');
  } // sortByNameAscending

} // module.exports
