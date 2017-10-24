/**
 * test/SubjectGroup.js
 */
'use strict';
const expect = require('chai').expect;
const SubjectGroup = require('../src/SubjectGroup');
const SubjectGroups = require('../src/SubjectGroups');

describe('SubjectGroups Tests', () => {
  const subject = {
    absolutePath: 'Fellowship.Gandalf.JJ1',
    isPublished: true,
    name: 'JJ1',
    parentAbsolutePath: 'Fellowship.Gandalf',
    relatedLinks: [],
  };

  const sample = { name: 'Fellowship.Gandalf.JJ1|LOCKERROOM',
    status: 'OK',
    previousStatus: 'Timeout',
    value: '0',
    relatedLinks: [],
    aspect: {
      isPublished: true,
      name: 'LOCKERROOM',
      rank: 0,
    }
  };

  describe('addSample ', () => {
    it('Adding sample should add both the sample and the aspect', () => {
      const subjectGroup = new SubjectGroup(subject.parentAbsolutePath,
        subject);
      subjectGroup.addSample(sample);
      const samples = subjectGroup.samples;
      const aspects = subjectGroup.aspects;
      expect(Object.keys(samples).length).to.equal(1);
      expect(Object.keys(aspects).length).to.equal(1);
      expect(samples[sample.name.toLowerCase()]).to.eql(sample);
      expect(aspects[sample.aspect.name.toLowerCase()]).to.eql(sample.aspect);
    });

    it('Samples and aspects should be added to their respective  data ' +
      'structures keyed off of their lowercased name', () => {
      const subjectGroup = new SubjectGroup(subject.parentAbsolutePath,
        subject);
      subjectGroup.addSample(sample);
      const samples = subjectGroup.samples;
      const aspects = subjectGroup.aspects;
      expect(samples[sample.name]).to.eql(undefined);
      expect(aspects[sample.aspect.name]).to.eql(undefined);
      expect(samples[sample.name.toLowerCase()]).to.eql(sample);
      expect(aspects[sample.aspect.name.toLowerCase()]).to.eql(sample.aspect);
    });
  });

  describe('updateSample ', () => {
    it('Updating sample should update both the sample and its related ' +
      'aspect', () => {
      const subjectGroup = new SubjectGroup(subject.parentAbsolutePath,
        subject);
      subjectGroup.addSample(sample);
      const updatedSample = { name: 'Fellowship.Gandalf.JJ1|LOCKERROOM',
        status: 'Critical',
        previousStatus: 'OK',
        value: '0',
        relatedLinks: [],
        aspect: {
          isPublished: true,
          name: 'LOCKERROOM',
          rank: 0,
          description: 'New Updated description',
        }
      };
      subjectGroup.updateSample(updatedSample);
      const samples = subjectGroup.samples;
      const aspects = subjectGroup.aspects;
      expect(samples[updatedSample.name.toLowerCase()]).to.eql(updatedSample);
      expect(aspects[updatedSample.aspect.name.toLowerCase()])
        .to.eql(updatedSample.aspect);
    });
  });

  describe('removeSample ', () => {
    it('Removing the sample should remove only the sample from the ' +
      'data structure', () => {
      const subjectGroup = new SubjectGroup(subject.parentAbsolutePath, subject);
      subjectGroup.addSample(sample);

      const samples = subjectGroup.samples;
      const aspects = subjectGroup.aspects;

      // make sure they were added
      expect(samples[sample.name.toLowerCase()]).to.eql(sample);
      expect(aspects[sample.aspect.name.toLowerCase()]).to.eql(sample.aspect);

      // remove the sample
      subjectGroup.removeSample(sample);
      expect(samples[sample.name.toLowerCase()]).to.eql(undefined);
      expect(aspects[sample.aspect.name.toLowerCase()])
        .to.eql(sample.aspect);
    });

    it('Remove a sample not in the sample data structure', () => {
      const subjectGroup = new SubjectGroup(subject.parentAbsolutePath, subject);
      subjectGroup.addSample(sample);

      const samples = subjectGroup.samples;
      const aspects = subjectGroup.aspects;

      expect(samples[sample.name.toLowerCase()]).to.eql(sample);
      expect(aspects[sample.aspect.name.toLowerCase()]).to.eql(sample.aspect);

      const sampleToRemove = { name: 'Fellowship.GandalfTheGrey.JJ1|WAND',
        status: 'OK',
        aspect: { name: 'WAND', },
      };

      subjectGroup.removeSample(sampleToRemove);

      // make sure the above action does not effect the existing sample/aspect
      expect(samples[sample.name.toLowerCase()]).to.eql(sample);
      expect(aspects[sample.aspect.name.toLowerCase()])
        .to.eql(sample.aspect);
    });
  });

  describe('getSubjectForSample', () => {
    it('Get only the subject related to the sample', () => {
      const subjectGroup = new SubjectGroup(subject.parentAbsolutePath, subject);
      subjectGroup.addSubject(subject);
      subjectGroup.addSample(sample);
      const subj = subjectGroup.getSubjectForSample(sample);
      expect(subj).to.eq(subject);
    });

    it('Return undefined for getting a subject not in the data ' +
      'structure', () => {
      const subjectGroup = new SubjectGroup(subject.parentAbsolutePath,
        subject);
      const subj = subjectGroup.getSubjectForSample(sample);
      expect(subj).to.eq(undefined);
    });
  });
});
