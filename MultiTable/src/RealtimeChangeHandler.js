/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * ./MultiTable/src/RealtimeChangeHandler.js
 */
'use strict';
const SubjectGroups = require('./SubjectGroups');
const SampleUtils = require('./SampleUtils');
const SubjectUtils = require('./SubjectUtils');
const INVALID_ARG = 'MultiTable|RealtimeChangeHandler.handle|Invalid arg: ';

function onSampleAdd(data, sample) {
  // console.log(new Date(), 'onSampleAdd', sample);
  if (data.rootSubject && SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const subjectGroup = data.getParentGroupForAbsolutePath(sample.name);
    if (subjectGroup) {
      subjectGroup.addSample(sample);
      const subject = subjectGroup.getSubjectForSample(sample);
      if (subject) {
        subject.samples.push(sample);
      }
    }
  }
}

function onSampleRemove(data, sample) {
  // console.log(new Date(), 'onSampleRemove', sample);
  if (data.rootSubject && SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const subjectGroup = data.getParentGroupForAbsolutePath(sample.name);
    if (subjectGroup) {
      subjectGroup.removeSample(sample);
      const subject = subjectGroup.getSubjectForSample(sample);
      if (subject) {
        const index = subject.samples.findIndex(s => (s.name === sample.name));
        if (index >= 0) {
          subject.samples.splice(index, 1);
        }
      }
    }
  }
}

function onSampleUpdate(data, change) {
  // console.log(new Date(), 'onSampleUpdate', change);
  if (data.rootSubject && SampleUtils.isUnderRootSubject(change, data.rootSubject)) {
    const subjectGroup = data.getParentGroupForAbsolutePath(change.name);
    if (subjectGroup) {
      subjectGroup.updateSample(change);
      const subject = subjectGroup.getSubjectForSample(change);
      if (subject) {
        const index = subject.samples.findIndex(s => (s.name === change.name));
        if (index >= 0) {
          subject.samples[index] = change;
        } else {
          subject.samples.push(change);
        }
      }
    }
  }
}

function onSubjectAdd(data, subject) {
  // console.log(new Date(), 'onSubjectAdd', subject);
  if (data.rootSubject && SubjectUtils.isUnderRootSubject(subject, data.rootSubject)) {
    if (!subject.samples) subject.samples = [];
    let subjectGroup = data.findGroupForNewSubject(subject);

    if (!subjectGroup) {
      const parentPath = subject.parentAbsolutePath;
      const grandparentGroup = data.getParentGroupForAbsolutePath(parentPath);
      if (!grandparentGroup) {
        return;
      };
      const parentSubject = grandparentGroup.subjects[parentPath.toLowerCase()];
      if (!parentSubject)  {
        return;
      };
      subjectGroup = data.addSubjectGroup(parentPath, parentSubject);
    }

    data.addSubject(subjectGroup, subject);

  }
}

function onSubjectRemove(data, subject) {
  // console.log(new Date(), 'onSubjectRemove', subject);
  if (data.rootSubject && SubjectUtils.isUnderRootSubject(subject, data.rootSubject)) {

    const parentGroup = data.getParentGroupForAbsolutePath(subject.absolutePath);
    if (parentGroup) {
      data.removeSubject(parentGroup, subject);
      if (parentGroup.isEmpty()) {
        data.removeGroup(parentGroup);
      }
    }

    const selfGroups = data.getSelfGroupsForAbsolutePath(subject.absolutePath);
    selfGroups.forEach((group) => {
      data.removeGroup(group);
    });

  }
}

function onSubjectUpdate(data, change) {
  // console.log(new Date(), 'onSubjectUpdate', change);
  if (data.rootSubject && SubjectUtils.isUnderRootSubject(change, data.rootSubject)) {
    if (!change.samples) change.samples = [];

    const parentGroup = data.getParentGroupForAbsolutePath(change.absolutePath);
    if (parentGroup) {
      parentGroup.updateSubject(change);
    }

    const selfGroups = data.getSelfGroupsForAbsolutePath(change.absolutePath);
    selfGroups.forEach((group) => {
      group.updateSelf(change);
    });

  }
}

function validateData(data) {
  if (data && data instanceof SubjectGroups) {
    return true;
  }

  throw new Error(INVALID_ARG + '"data" must be instance of SubjectGroups.');
}

function validateChg(chg) {
  if (chg && typeof chg === 'object' && (
    chg.hasOwnProperty('sample.add') ||
    chg.hasOwnProperty('sample.remove') || (
      chg.hasOwnProperty('sample.update') &&
      chg['sample.update'].hasOwnProperty('new')
    ) ||
    chg.hasOwnProperty('subject.add') ||
    chg.hasOwnProperty('subject.remove') || (
      chg.hasOwnProperty('subject.update') &&
      chg['subject.update'].hasOwnProperty('new')
    )
  )) {
    return true;
  }

  throw new Error(INVALID_ARG + '"chg" must be an object with an attribute ' +
    'corresponding to the type of the realtime event.');
}

module.exports = class RealtimeChangeHandler {

  /**
   * Handle each type of change by updating the data accordingly.
   *
   * @throws Error if invalid chg or data
   */
  static handle(chg, data) {
    validateData(data);
    validateChg(chg);
    if (chg['sample.add']) {
      onSampleAdd(data, chg['sample.add']);
    } else if (chg['sample.remove']) {
      onSampleRemove(data, chg['sample.remove']);
    } else if (chg['sample.update'] && chg['sample.update'].new) {
      onSampleUpdate(data, chg['sample.update'].new);
    } else if (chg['subject.add']) {
      onSubjectAdd(data, chg['subject.add']);
    } else if (chg['subject.remove']) {
      onSubjectRemove(data, chg['subject.remove']);
    } else if (chg['subject.update'] && chg['subject.update'].new) {
      onSubjectUpdate(data, chg['subject.update'].new);
    }
  }

}; // module.exports
