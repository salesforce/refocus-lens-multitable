'use strict';
const SubjectGroups = require('./SubjectGroups');
const SampleUtils = require('./SampleUtils');
const SubjectUtils = require('./SubjectUtils');

function onSampleAdd(data, sample) {
  // console.log(new Date(), 'onSampleAdd', sample);
  if (SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const subjectGroup = data.getGroupForAbsolutePath(sample.name);
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
  if (SampleUtils.isUnderRootSubject(sample, data.rootSubject)) {
    const subjectGroup = data.getGroupForAbsolutePath(sample.name);
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
  if (SampleUtils.isUnderRootSubject(change, data.rootSubject)) {
    const subjectGroup = data.getGroupForAbsolutePath(change.name);
    if (subjectGroup) {
      subjectGroup.updateSample(change);
      const subject = subjectGroup.getSubjectForSample(change);
      if (subject) {
        const index = subject.samples.findIndex(s => (s.name === change.name));
        if (index >= 0) {
          subject.samples[index] = change;
        }
      }
    }
  }
}

function onSubjectAdd(data, subject) {
  // console.log(new Date(), 'onSubjectAdd', subject);
  if (SubjectUtils.isUnderRootSubject(subject, data.rootSubject)) {
    if (!subject.samples) subject.samples = [];
    const subjectGroup = data.findGroupForNewSubject(subject);
    if (subjectGroup) {
      data.addSubject(subjectGroup, subject);
    } else {
      const n = SubjectGroups.groupName(subject.absolutePath);
      data.addSubjectGroup(n, subject);
    }
  }
}

function onSubjectRemove(data, subject) {
  // console.log(new Date(), 'onSubjectRemove', subject);
  if (SubjectUtils.isUnderRootSubject(subject, data.rootSubject)) {
    const subjectGroup = data.getGroupForAbsolutePath(subject.absolutePath);
    if (subjectGroup) {
      data.removeSubject(subjectGroup, subject);
    }
  }
}

function onSubjectUpdate(data, change) {
  // console.log(new Date(), 'onSubjectUpdate', change);
  if (SubjectUtils.isUnderRootSubject(change, data.rootSubject)) {
    if (!change.samples) change.samples = [];
    const subjectGroup = data.getGroupForAbsolutePath(change.absolutePath);
    if (subjectGroup) {
      subjectGroup.updateSubject(change);
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

}; // module.exports
