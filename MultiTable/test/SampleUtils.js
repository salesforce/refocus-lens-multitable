/**
 * test/SampleUtils.js
 */
'use strict';
const expect = require('chai').expect;
const SampleUtils = require('../src/SampleUtils');

describe('SampleUtils Tests', () => {
  describe('elapsedMillis', () => {
    it('happy path with two args', () => {
      const s1 = '2016-05-27T23:11:19.467Z';
      const s2 = '2016-05-27T23:12:20.469Z';
      expect(SampleUtils.elapsedMillis(s1, s2))
        .to.equal(61002);
    });

    it('happy path with one arg in the past', () => {
      expect(SampleUtils.elapsedMillis('2016-05-27T23:11:19.467Z'))
        .to.be.above(0);
    });

    it('happy path with one arg in the future', () => {
      expect(SampleUtils.elapsedMillis('2216-05-27T23:11:19.467Z'))
        .to.be.below(0);
    });

    it('Invalid Date');
  }); // elapsedMillis

  describe('isUnderRootSubject', () => {
    it('return true', () => {
      const sample = { name: 'Fellowship.Gandalf.JJ1.A9|LOCKERROOM' };
      const subjectAbsolutePath = 'Fellowship.Gandalf.JJ1.A9';
      expect(SampleUtils.isUnderRootSubject(sample, subjectAbsolutePath))
        .to.equal(true);
    });

    it('return true with all lowercase', () => {
      const sample = { name: 'fellowship.gandalf.jj1.A9|LOCKERROOM'};
      const subjectAbsolutePath = 'fellowship.gandalf.jj1.A9';
      expect(SampleUtils.isUnderRootSubject(sample, subjectAbsolutePath))
        .to.equal(true);
    });

    it('return true with some lower and some upper', () => {
      const sample =  { name: 'Fellowship.Gandalf.JJ1.A9|LOCKERROOM'};
      const subjectAbsolutePath = 'fellowship.gandalf.jj1.A9';
      expect(SampleUtils.isUnderRootSubject(sample, subjectAbsolutePath))
        .to.equal(true);
    });

    it('return true with some lower and some upper', () => {
      const sample = { name: 'Fellowship.Gandalf.JJ1.A9|LOCKERROOM' };
      const subject = 'fellowship.gandalf.jj1.A9';
      expect(SampleUtils.isUnderRootSubject(sample, subject))
        .to.equal(true);
    });

    it('return false', () => {
      const sample = { name: 'Fellowship.Gandalf.JJ1.A9|LOCKERROOM' };
      const subjectAbsolutePath = 'Fellowship.GandalfTheGrey.jj1.A9';
      expect(SampleUtils.isUnderRootSubject(sample, subjectAbsolutePath))
        .to.equal(false );
    });

    it('return true when subjectAbsolutePath is an empty string', () => {
      const sample = { name: 'Fellowship.Gandalf.JJ1.A9|LOCKERROOM' };
      const subjectAbsolutePath = '';
      expect(SampleUtils.isUnderRootSubject(sample, subjectAbsolutePath))
        .to.equal(true );
    });
  }); // isUnderRootSubject

  describe('isNotOK', () => {
    it('status is not OK', () => {
      expect(SampleUtils.isNotOK({ status: 'Info' })).to.equal(true);
    });

    it('status is OK', () => {
      expect(SampleUtils.isNotOK({ status: 'OK' })).to.equal(false);
    });
  }); // isNotOK

  describe('isOK', () => {
    it('status is OK', () => {
      expect(SampleUtils.isOK({ status: 'OK' })).to.equal(true);
    })

    it('status is not OK', () => {
      expect(SampleUtils.isOK({ status: 'Warning' })).to.equal(false);
    })

    it('status is missing', () => {
      try {
        SampleUtils.isOK({});
        expect.fail();
      } catch (e) {
        expect(e.name).to.equal('MissingAttributeException');
      }
    });

  it('status is not valid', () => {
      try {
        SampleUtils.isOK({ status: 'Whatever' });
        expect.fail();
      } catch (e) {
        expect(e.name).to.equal('IllegalValueException');
      }
    });
  }); // isOK

  describe('splitName', () => {
    it('OK', () => {
      const obj = SampleUtils.splitName('a.b.c|d');
      expect(obj.subject.absolutePath).to.equal('a.b.c');
      expect(obj.aspect.name).to.equal('d');
    });

    it('not a sample name', () => {
      try {
        const obj = SampleUtils.splitName('The quick brown fox');
        expect.fail();
      } catch (e) {
        expect(e.name).to.equal('InvalidNameException');
      }
      // expect(obj.subjectAbsolutePath).to.equal('a.b.c');
      // expect(obj.aspectName).to.equal('d');
    });
  }); // splitName

  describe('statusChangedRecently', () => {
    it('expect true', () => {
      const d = new Date().getTime() - (1 * 60 * 1000);
      const sample = {
        statusChangedAt: d,
      };
      const thresholdMillis = 2 * 60 * 1000;
      const recentlyChanged =
        SampleUtils.statusChangedRecently(sample, thresholdMillis);
      expect(recentlyChanged).to.equal(true);
    });

    it('expect false', () => {
      const d = new Date().getTime() - (10 * 60 * 1000);
      const sample = {
        statusChangedAt: d,
      };
      const thresholdMillis = 2 * 60 * 1000;
      const recentlyChanged =
        SampleUtils.statusChangedRecently(sample, thresholdMillis);
      expect(recentlyChanged).to.equal(false);
    });
  }); // statusChangedRecently

  describe('filterOnlyOK', () => {
    it('good', () => {
      const arr = [{ status: 'OK' }, { status: 'Critical' }];
      const filtered = arr.filter(SampleUtils.filterOnlyOK);
      expect(filtered).to.have.lengthOf(1);
    });

    it('with a bad sample', () => {
      const arr = [{ status: 'OK' }, { status: 'Critical' }, {}];
      try {
        const filtered = arr.filter(SampleUtils.filterOnlyOK);
        expect.fail();
      } catch (e) {
        expect(e.name).to.equal('MissingAttributeException');
      }
    });

    it('with a bad status', () => {
      const arr = [{ status: 'OK' }, { status: 'Critical' }, { status: 'Jim' }];
      try {
        const filtered = arr.filter(SampleUtils.filterOnlyOK);
        expect.fail();
      } catch (e) {
        expect(e.name).to.equal('IllegalValueException');
      }
    });
  }); // filterOnlyOK

  describe('filterOnlyNotOK', () => {
    it('good', () => {
      const arr = [
        { status: 'OK' },
        { status: 'Critical' },
        { status: 'Warning' },
        { status: 'Warning' },
      ];
      const filtered = arr.filter(SampleUtils.filterOnlyNotOK);
      expect(filtered).to.have.lengthOf(3);
    });
  }); // filterOnlyNotOK

  describe('sortByStatusWorstToBestThenNameAscending', () => {
    it('good', () => {
      const arr = [
        { name: 'x|y', status: 'OK' },
        { name: 'a|y', status: 'Warning' },
        { name: 'X|a', status: 'Warning' },
        { name: 'a|a', status: 'OK' },
      ];
      arr.sort(SampleUtils.sortByStatusWorstToBestThenNameAscending);
      expect(arr[0].name).to.equal('a|y');
      expect(arr[1].name).to.equal('X|a');
      expect(arr[2].name).to.equal('a|a');
      expect(arr[3].name).to.equal('x|y');
    });
  }); // sortByStatusWorstToBestThenNameAscending

  describe('sortByStatusChangedAtDescending', () => {
    it('good', () => {
      const arr = [
        { name: 'x|y', statusChangedAt: '2016-05-27T23:11:19.467Z' },
        { name: 'a|y', statusChangedAt: '2016-05-28T13:11:19.467Z' },
        { name: 'X|a', statusChangedAt: '2016-05-30T23:11:18.467Z' },
        { name: 'a|a', statusChangedAt: '2016-05-29T23:11:19.167Z' },
      ];
      arr.sort(SampleUtils.sortByStatusChangedAtDescending);
      expect(arr[0].name).to.equal('X|a');
      expect(arr[1].name).to.equal('a|a');
      expect(arr[2].name).to.equal('a|y');
      expect(arr[3].name).to.equal('x|y');
    });
  }); // sortByStatusChangedAtDescending
});
