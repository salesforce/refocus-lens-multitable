'use strict';
const SubjectGroups = require('./SubjectGroups');
const SampleUtils = require('./SampleUtils');
const SubjectUtils = require('./SubjectUtils');

function onSampleAdd(data, sample) {
  // console.log(new Date(), 'onSampleAdd', sample);
  if (SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const n = SubjectGroups.groupName(sample.name);
    data.getSubjectGroup(n).addSample(sample);
  }
}

function onSampleRemove(data, sample) {
  // console.log(new Date(), 'onSampleRemove', sample);
  if (SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const n = SubjectGroups.groupName(sample.name);
    data.getSubjectGroup(n).removeSample(sample);
  }
}

function onSampleUpdate(data, change) {
  // console.log(new Date(), 'onSampleUpdate', change);
  if (SampleUtils.isUnderRootSubject(change.new, data.rootSubject)) {
    const n = SubjectGroups.groupName(change.new.name);
    data.getSubjectGroup(n).updateSample(change.new);
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
    const gr = data.getSubjectGroup(n);
    if (gr) {
      gr.removeSubject(subject);
    }
  }
}

function onSubjectUpdate(data, change) {
  // console.log(new Date(), 'onSubjectUpdate', change);
  if (SubjectUtils.isUnderRootSubject(change.new, data.rootSubject)) {
    const n = SubjectGroups.groupName(change.new.absolutePath);
    data.getSubjectGroup(n).updateSubject(change.new);
  }
}

module.exports = class RealtimeChangeHandler {

  static handle(chg, data) {
    if (chg['sample.add']) {
      onSampleAdd(data, chg['sample.add']);
    } else if (chg['sample.remove']) {
      onSampleRemove(data, chg['sample.remove']);
    } else if (chg['sample.update']) {
      onSampleUpdate(data, chg['sample.update']);
    } else if (chg['subject.add']) {
      onSubjectAdd(data, chg['subject.add']);
    } else if (chg['subject.remove']) {
      onSubjectRemove(data, chg['subject.remove']);
    } else if (chg['subject.update']) {
      onSubjectUpdate(data, chg['subject.update']);
    }
  }

} // module.exports
