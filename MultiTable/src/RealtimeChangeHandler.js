'use strict';
const SubjectGroups = require('./SubjectGroups');
const SampleUtils = require('./SampleUtils');
const SubjectUtils = require('./SubjectUtils');

function onSampleAdd(data, sample) {
  // console.log(new Date(), 'onSampleAdd', sample);
  if (SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const n = SubjectGroups.groupName(sample.name);
    if (data.hasSubjectGroup(n)) {
      data.getSubjectGroup(n).addSample(sample);
    }
  }
}

function onSampleRemove(data, sample) {
  // console.log(new Date(), 'onSampleRemove', sample);
  if (SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const n = SubjectGroups.groupName(sample.name);
    if (data.hasSubjectGroup(n)) {
      data.getSubjectGroup(n).removeSample(sample);
    }
  }
}

function onSampleUpdate(data, change) {
  // console.log(new Date(), 'onSampleUpdate', change);
  if (SampleUtils.isUnderRootSubject(change, data.rootSubject)) {
    const n = SubjectGroups.groupName(change.name);
    if (data.hasSubjectGroup(n)) {
      data.getSubjectGroup(n).updateSample(change);
    }
  }
}

function onSubjectAdd(data, subject) {
  // console.log(new Date(), 'onSubjectAdd', subject);
  if (SubjectUtils.isUnderRootSubject(subject, data.rootSubject)) {
    const n = SubjectGroups.groupName(subject.absolutePath);
    if (data.hasSubjectGroup(n)) {
      data.getSubjectGroup(n).addSubject(subject);
    } else {
      data.addSubjectGroup(n, subject);
    }
  }
}

function onSubjectRemove(data, subject) {
  // console.log(new Date(), 'onSubjectRemove', subject);
  if (SubjectUtils.isUnderRootSubject(subject, data.rootSubject)) {
    const n = SubjectGroups.groupName(subject.absolutePath);
    if (data.hasSubjectGroup(n)) {
      data.getSubjectGroup(n).removeSubject(subject);
    }
  }
}

function onSubjectUpdate(data, change) {
  // console.log(new Date(), 'onSubjectUpdate', change);
  if (SubjectUtils.isUnderRootSubject(change, data.rootSubject)) {
    const n = SubjectGroups.groupName(change.absolutePath);
    if (data.hasSubjectGroup(n)) {
      data.getSubjectGroup(n).updateSubject(change);
    }
  }
}

module.exports = class RealtimeChangeHandler {

  static handle(chg, data) {
    if (data && chg) {
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
  }

} // module.exports
