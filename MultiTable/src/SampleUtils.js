/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * ./MultiTable/src/SampleUtils.js
 */
'use strict';

const Utils = require('./Utils');

function InvalidNameException(str) {
  this.message = `"${str}" is not a valid sample name.`;
  this.name = 'InvalidNameException';
}

function IllegalValueException(attr, val) {
  this.attribute = attr;
  this.message = `"${val}" is not a valid value for attribute "${attr}".`;
  this.name = 'IllegalValueException';
}

function MissingAttributeException(attr) {
  this.attribute = attr;
  this.message = `Sample must have a "${attr}" attribute.`;
  this.name = 'MissingAttributeException';
}

const statuses = ['Critical', 'Invalid', 'Timeout', 'Warning', 'Info', 'OK'];

module.exports = class SampleUtils {

  /**
   * Parses the sample name and returns an object containing its aspect name
   * and subject absolutePath. Throws an InvalidSampleNameException if the
   * sample name cannot be parsed.
   */
  static splitName(name) {
    const arr = name.split('|');
    if (arr.length == 2) {
      return {
        subject: {
          absolutePath: arr[0],
        },
        aspect: {
          name: arr[1],
        },
      };
    }
    throw new InvalidNameException(name);
  } // splitName

  static isOK(sample) {
    if (sample.status === undefined) {
      throw new MissingAttributeException('status');
    }

    if (!statuses.includes(sample.status)) {
      throw new IllegalValueException('status', sample.status);
    }

    return sample.status === 'OK';
  } // isOK

  static isNotOK(sample) {
    return !SampleUtils.isOK(sample);
  } // isNotOK

  /**
   * Returns the milliseconds elapsed between the two datetime strings. The
   * second argument is expected to be greater than the first argument. If the
   * second argument is undefined, it assumes "now".
   */
  static elapsedMillis(s1, s2) {
    let t1 = new Date(s1).getTime();
    let t2 = s2 ? (new Date(s2)).getTime() : Date.now();
    return t2 - t1;
  } // elapsedMillis

  static statusChangedRecently(sample, threshold) {
    if (sample.statusChangedAt === undefined) {
      throw new MissingAttributeException('statusChangedAt');
    }

    return SampleUtils.elapsedMillis(sample.statusChangedAt) < threshold;
  } // statusChangedRecently

  static isUnderRootSubject(sample, rootSubject) {
    return sample.name.toLowerCase()
      .startsWith(rootSubject.toLowerCase()) === true;
  } // isUnderRootSubject

  /**
   * Filters an array of samples, returning only those samples with status OK
   */
  static filterOnlyOK(sample) {
    return SampleUtils.isOK(sample);
  } // onlyIfOK

  /**
   * Filters an array of samples, returning only those samples with status
   * *not* OK.
   */
  static filterOnlyNotOK(sample) {
    return SampleUtils.isNotOK(sample);
  } // onlyIfOK

  /**
   * Use this sort function to sort an array of samples from worst to best by
   * status then in ascending order by name (not case sensitive).
   */
  static sortByStatusWorstToBestThenNameAscending(a, b) {
    return Utils.sort(`${statuses.indexOf(a.status)}#${a.name.toLowerCase()}`,
      `${statuses.indexOf(b.status)}#${b.name.toLowerCase()}`);
  } // sortByStatusWorstToBestThenNameAscending

  /*
   * Use this sort function to sort an array of samples in descending order by
   * statusChangedAt.
   */
  static sortByStatusChangedAtDescending(a, b) {
    return Utils.sort(b.statusChangedAt, a.statusChangedAt);
  } // sortByStatusChangedAtDescending

}; // module.exports
