/**
 * test/SubjectGroup.js
 */
'use strict';
const expect = require('chai').expect;
const SubjectGroup = require('../src/SubjectGroup');
const SubjectGroups = require('../src/SubjectGroups');

describe('./test/SubjectGroup.js >', () => {
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
    },
  };

  describe('addSubject ', () => {
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
        },
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

  describe('getSubjectsToShow', () => {
    const subjectGroup = new SubjectGroup(subject.parentAbsolutePath, subject);
    subjectGroup.subjects = {
      abc: { name: 'abc' },
      test: { name: 'test' },
      xyz: { name: 'xyz' },
      zzzz: { name: 'zzzz' },
    };

    it('Default behaviour', (done) => {
      const expectedArray = [
        { name: 'abc' },
        { name: 'test' },
        { name: 'xyz' },
        { name: 'zzzz' },
      ];
      subjectGroup.subjectsToShow = new Set(['Abc', 'zzzz', 'test', 'xyz']);
      expect(subjectGroup.getSubjectsToShow())
       .to.be.deep.equal(expectedArray);
      return done();
    });

    it('Subject is not present in Subjects object', (done) => {
      subjectGroup.subjectsToShow = new Set(['Abc', 'zz', 'test', 'xyz']);
      const expectedArray = [
        { name: 'abc' },
        { name: 'test' },
        { name: 'xyz' },
      ];
      expect(subjectGroup.getSubjectsToShow())
        .to.be.deep.equal(expectedArray);
      return done();
    });
  });

  describe('trackSampleAspectAndSubject', () => {
    const subjectGroup = new SubjectGroup(subject.parentAbsolutePath, subject);

    subjectGroup.subjects = {
      abc: { name: 'abc' },
      test: { name: 'test' },
      xyz: { name: 'xyz' },
      zzzz: { name: 'zzzz' },
    };

    subjectGroup.aspects = {
      test1: { name: 'test1' },
      test2: { name: 'test2' },
    };

    beforeEach(() => {
      subjectGroup.subjectsToShow = new Set([]);
      subjectGroup.aspectsToShow = new Set([]);
    });

    subjectGroup.aspects = {
      test1: { name: 'test1' },
      test2: { name: 'test2' },
    };

    it('Default behaviour', (done) => {
      subjectGroup.showAll = false;
      const sample1 = {
        name: 'abc|test1',
        status: 'Critical',
      };

      subjectGroup.trackSampleAspectAndSubject(sample1);
      expect(subjectGroup.subjectsToShow.size).to.equal(1);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.true;
      expect(subjectGroup.aspectsToShow.size).to.equal(1);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('Status is OK then do not show subject and aspect', (done) => {
      subjectGroup.showAll = false;
      const sample1 = {
        name: 'abc|test1',
        status: 'OK',
      };

      subjectGroup.trackSampleAspectAndSubject(sample1);
      expect(subjectGroup.subjectsToShow.size).to.equal(0);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.false;
      expect(subjectGroup.aspectsToShow.size).to.equal(0);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.false;
      return done();
    });

    it('showAll is on and OK status still show all aspect and subject',
      (done) => {
      subjectGroup.showAll = true;
      const sample1 = {
        name: 'abc|test1',
        status: 'OK',
      };

      subjectGroup.trackSampleAspectAndSubject(sample1);
      expect(subjectGroup.subjectsToShow.size).to.equal(1);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.true;
      expect(subjectGroup.aspectsToShow.size).to.equal(1);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('Subject not present', (done) => {
      const sample1 = {
        name: 'abc123|test1',
        status: 'Critical',
      };

      subjectGroup.trackSampleAspectAndSubject(sample1);
      expect(subjectGroup.subjectsToShow.size).to.equal(0);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.false;
      expect(subjectGroup.aspectsToShow.size).to.equal(1);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('Aspect not present', (done) => {
      const sample1 = {
        name: 'abc|test3',
        status: 'Critical',
      };

      subjectGroup.trackSampleAspectAndSubject(sample1);
      expect(subjectGroup.subjectsToShow.size).to.equal(1);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.true;
      expect(subjectGroup.aspectsToShow.size).to.equal(0);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.false;
      return done();
    });

    it('Aspect and Subject not present', (done) => {
      const sample1 = {
        name: 'abc123|test3',
        status: 'Critical',
      };

      subjectGroup.trackSampleAspectAndSubject(sample1);
      expect(subjectGroup.subjectsToShow.size).to.equal(0);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.false;
      expect(subjectGroup.aspectsToShow.size).to.equal(0);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.false;
      return done();
    });
  });

  describe('reset', () => {
    const subjectGroup = new SubjectGroup(subject.parentAbsolutePath, subject);

    subjectGroup.subjects = {
      abc: { name: 'abc' },
      test: { name: 'test' },
      xyz: { name: 'xyz' },
      zzzz: { name: 'zzzz' },
    };

    subjectGroup.aspects = {
      test1: { name: 'test1' },
      test2: { name: 'test2' },
    };

    beforeEach(() => {
      subjectGroup.subjectsToShow = new Set([]);
      subjectGroup.aspectsToShow = new Set([]);
    });

    it('Without passing showAll flag', (done) => {
      subjectGroup.samples = [
        {
          name: 'abc|test1',
          status: 'Critical',
        },
        {
          name: 'abc|test2',
          status: 'Critical',
        },
      ];

      subjectGroup.reset();
      expect(subjectGroup.subjectsToShow.size).to.equal(1);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.true;
      expect(subjectGroup.aspectsToShow.size).to.equal(2);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('With showAll flag true and sample status Critical', (done) => {
      subjectGroup.samples = [
        {
          name: 'abc|test1',
          status: 'Critical',
        },
        {
          name: 'abc|test2',
          status: 'Critical',
        },
      ];

      subjectGroup.reset(true);
      expect(subjectGroup.subjectsToShow.size).to.equal(1);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.true;
      expect(subjectGroup.aspectsToShow.size).to.equal(2);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('With passing showAll flag true and sample status OK', (done) => {
      subjectGroup.samples = [
        {
          name: 'abc|test1',
          status: 'OK',
        },
        {
          name: 'abc|test2',
          status: 'OK',
        },
      ];

      subjectGroup.reset(true);
      expect(subjectGroup.subjectsToShow.size).to.equal(1);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.true;
      expect(subjectGroup.aspectsToShow.size).to.equal(2);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('With passing showAll flag false and mix sample status', (done) => {
      subjectGroup.samples = [
        {
          name: 'abc|test1',
          status: 'OK',
        },
        {
          name: 'abc|test2',
          status: 'Critical',
        },
      ];

      subjectGroup.reset(false);
      expect(subjectGroup.subjectsToShow.size).to.equal(1);
      expect(subjectGroup.subjectsToShow.has('abc')).to.be.true;
      expect(subjectGroup.aspectsToShow.size).to.equal(1);
      expect(subjectGroup.aspectsToShow.has('test1')).to.be.false;
      expect(subjectGroup.aspectsToShow.has('test2')).to.be.true;
      return done();
    });
  });
});
