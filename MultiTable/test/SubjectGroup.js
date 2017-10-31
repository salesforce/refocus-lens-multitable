/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * ./MultiTable/test/SubjectGroup.js
 */

'use strict';
const expect = require('chai').expect;
const SubjectGroup = require('../src/SubjectGroup');

const SubjectGroupObject = new SubjectGroup('test', [1,2,3], true, 2);

describe('SubjectGroup Tests', () => {
  describe('getSubjectsToShow', () => {
    SubjectGroupObject.subjects = {
      abc: {name: 'abc'},
      test: {name: 'test'},
      xyz: {name: 'xyz'},
      zzzz: {name: 'zzzz'},
    };

  	it('Default behaviour', (done) => {
      const expectedArray = [
       { name: 'abc' },{ name: 'test' },{ name: 'xyz' },{ name: 'zzzz' } ];
      SubjectGroupObject.subjectsToShow = new Set(['Abc', 'zzzz', 'test', 'xyz']);
      expect(SubjectGroupObject.getSubjectsToShow())
       .to.be.deep.equal(expectedArray);
      return done();
    });

    it('Subject is not present in Subjects object', (done) => {
      SubjectGroupObject.subjectsToShow = new Set(['Abc', 'zz', 'test', 'xyz']);
      const expectedArray = [
      { name: 'abc' },{ name: 'test' },{ name: 'xyz' } ];
      expect(SubjectGroupObject.getSubjectsToShow())
        .to.be.deep.equal(expectedArray);
      return done();
    });
  });

  describe('trackSampleAspectAndSubject', () => {
    beforeEach(() => {
      SubjectGroupObject.subjectsToShow = new Set([]);
      SubjectGroupObject.aspectsToShow = new Set([]);
    });

    SubjectGroupObject.aspects = {
      test1: {name: 'test1'},
      test2: {name: 'test2'},
    };
    
    it('Default behaviour', (done) => {
      SubjectGroupObject.showAll = false;
      const sample = {
        name: 'abc|test1',
        status: 'Critical',
      };

      SubjectGroupObject.trackSampleAspectAndSubject(sample);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.true;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('Status is OK then do not show subject and aspect', (done) => {
      SubjectGroupObject.showAll = false;
      const sample = {
        name: 'abc|test1',
        status: 'OK',
      };

      SubjectGroupObject.trackSampleAspectAndSubject(sample);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.false;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.false;
      return done();
    });

    it('showAll is on and OK status still show all aspect and subject',
      (done) => {
      SubjectGroupObject.showAll = true;
      const sample = {
        name: 'abc|test1',
        status: 'OK',
      };

      SubjectGroupObject.trackSampleAspectAndSubject(sample);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.true;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('showAll is off and OK status present then do not show that' +
      'subject and aspect', (done) => {
      SubjectGroupObject.showAll = false;
      SubjectGroupObject.subjectsToShow = new Set([]);
      const sample = {
        name: 'abc|test1',
        status: 'OK',
      };

      SubjectGroupObject.trackSampleAspectAndSubject(sample);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.false;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.false;
      return done();
    });

    it('Subject not present', (done) => {
      SubjectGroupObject.subjectsToShow = new Set([]);
      const sample = {
        name: 'abc123|test1',
        status: 'Critical',
      };

      SubjectGroupObject.trackSampleAspectAndSubject(sample);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.false;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('Aspect not present', (done) => {
      SubjectGroupObject.subjectsToShow = new Set([]);
      const sample = {
        name: 'abc|test3',
        status: 'Critical',
      };

      SubjectGroupObject.trackSampleAspectAndSubject(sample);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.true;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.false;
      return done();
    });

    it('Aspect and Subject not present', (done) => {
      SubjectGroupObject.subjectsToShow = new Set([]);
      const sample = {
        name: 'abc123|test3',
        status: 'Critical',
      };

      SubjectGroupObject.trackSampleAspectAndSubject(sample);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.false;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(0);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.false;
      return done();
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      SubjectGroupObject.subjectsToShow = new Set([]);
      SubjectGroupObject.aspectsToShow = new Set([]);
    });

    it('Without passing showAll flag', (done) => {
      SubjectGroupObject.samples = [
        {
          name: 'abc|test1',
          status: 'Critical',
        },
        {
          name: 'abc|test2',
          status: 'Critical',
        },
      ];

      SubjectGroupObject.reset();
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.true;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(2);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('With showAll flag true and sample status Critical', (done) => {
      SubjectGroupObject.samples = [
        {
          name: 'abc|test1',
          status: 'Critical',
        },
        {
          name: 'abc|test2',
          status: 'Critical',
        },
      ];

      SubjectGroupObject.reset(true);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.true;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(2);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('With passing showAll flag true and sample status OK', (done) => {
      SubjectGroupObject.samples = [
        {
          name: 'abc|test1',
          status: 'OK',
        },
        {
          name: 'abc|test2',
          status: 'OK',
        },
      ];

      SubjectGroupObject.reset(true);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.true;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(2);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.true;
      return done();
    });

    it('With passing showAll flag false and mix sample status', (done) => {
      SubjectGroupObject.samples = [
        {
          name: 'abc|test1',
          status: 'OK',
        },
        {
          name: 'abc|test2',
          status: 'Critical',
        },
      ];

      SubjectGroupObject.reset(false);
      expect(SubjectGroupObject.subjectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.subjectsToShow.has('abc')).to.be.true;
      expect(SubjectGroupObject.aspectsToShow.size).to.equal(1);
      expect(SubjectGroupObject.aspectsToShow.has('test1')).to.be.false;
      expect(SubjectGroupObject.aspectsToShow.has('test2')).to.be.true;
      return done();
    });
  });
});