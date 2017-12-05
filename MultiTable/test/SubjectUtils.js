/**
 * test/SubjectUtils.js
 */
'use strict';
const expect = require('chai').expect;
const SubjectUtils = require('../src/SubjectUtils');

describe('SubjectUtils Tests', () => {
  describe('isUnderRootSubject', () => {
    it('return true', () => {
      const subject = { absolutePath: 'Fellowship.Gandalf.JJ1.A9' };
      const rootSubject = 'Fellowship.Gandalf';
      expect(SubjectUtils.isUnderRootSubject(subject, rootSubject))
        .to.equal(true);
    });

    it('return true with all lowercase', () => {
      const subject = { absolutePath: 'Fellowship.Gandalf.JJ1.A9' };
      const rootSubject = 'fellowship.gandalf';
      expect(SubjectUtils.isUnderRootSubject(subject, rootSubject))
        .to.equal(true);
    });

    it('return true with some lower and some upper', () => {
      const subject = { absolutePath: 'Fellowship.Gandalf.JJ1.A9' };
      const rootSubject = 'Fellowship.gandalf';
      expect(SubjectUtils.isUnderRootSubject(subject, rootSubject))
        .to.equal(true);
    });

    it('return false', () => {
      const subject = { absolutePath: 'Fellowship.Gandalf.JJ1.A9' };
      const rootSubject = 'Fellowship.gandalf.JJ2';
      expect(SubjectUtils.isUnderRootSubject(subject, rootSubject))
        .to.equal(false);
    });

    it('return false when rootSubject is an empty string', () => {
      const subject = { absolutePath: 'Fellowship.Gandalf.JJ1.A9' };
      const rootSubject = '';
      expect(SubjectUtils.isUnderRootSubject(subject, rootSubject))
        .to.equal(false);
    });

    it('return false when rootSubject is null', () => {
      const subject = { absolutePath: 'Fellowship.Gandalf.JJ1.A9' };
      expect(SubjectUtils.isUnderRootSubject(subject, null))
        .to.equal(false);
    });

    it('return false when subject is null', () => {
      const rootSubject = 'Fellowship.gandalf';
      expect(SubjectUtils.isUnderRootSubject(null, null))
        .to.equal(false);
    });

    it('return false when subject absolutePath null', () => {
      const subject = { absolutePath: null };
      const rootSubject = 'Fellowship.gandalf.JJ1';
      expect(SubjectUtils.isUnderRootSubject(subject, rootSubject))
        .to.equal(false);
    });
  }); // isUnderRootSubject
});
