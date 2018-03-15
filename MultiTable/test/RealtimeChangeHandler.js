/**
 * test/RealtimeChangeHandler.js
 */
'use strict';
const expect = require('chai').expect;
const RealtimeChangeHandler = require('../src/RealtimeChangeHandler');
const SubjectGroups = require('../src/SubjectGroups');
const SubjectGroup = require('../src/SubjectGroup');

describe('./test/RealtimeChangeHandler.js >', () => {
  const sgArgs = { absolutePath: 'a', name: 'a' };

  it('ok - valid data arg and valid chg arg', () => {
    const data = new SubjectGroups(sgArgs);
    const chg = { 'sample.add': { name: 'a|b', aspect: { name: 'b'} } };
    RealtimeChangeHandler.handle(chg, data);
    expect(data instanceof SubjectGroups).to.be.true;
    expect(data).to.have.property('rootSubject', 'a');
    expect(data.map).to.have.property('a');
  });

  describe('handle: updateSample >', () => {
    it('updateSample should be called for a sample update event', () => {
      const _sgArgs = { absolutePath: 'Fellowship', name: 'Fellowship'}
      const data = new SubjectGroups(_sgArgs);
      const sample = { name: 'Fellowship|View', status: 'OK',
        aspect: { name: 'View'} };
      let chg = { 'sample.add': sample };
      RealtimeChangeHandler.handle(chg, data);
      const updatedSample = { name: 'Fellowship|View', status: 'Critical',
        aspect: { name: 'View'} };
      chg = { 'sample.update': { new : updatedSample } };
      RealtimeChangeHandler.handle(chg, data);

      /*
       * make sure that the samples instance object of the subjectGroup is
       * updated
       */
      expect(data.map.fellowship.samples['fellowship|view'])
        .to.eq(updatedSample);
      expect(Object.keys(data.map.fellowship.samples)).to.have.lengthOf(1);

      /*
       * make sure that the subjects instance object of the subjectGroup has
       * the updated sample
       */
      expect(data.map.fellowship.subjects.fellowship.samples)
        .to.have.lengthOf(1);
      expect(data.map.fellowship.subjects.fellowship.samples[0]).to
        .eql(updatedSample);
     });

    it('updateSample should add sample to the subject array if not ' +
      'found', () => {
      const _sgArgs = { absolutePath: 'Ring', name: 'Ring'}
      const data = new SubjectGroups(_sgArgs);
      const sample = { name: 'Ring|Color', status: 'OK',
        aspect: { name: 'Color'} };
      let chg = { 'sample.add': sample };
      RealtimeChangeHandler.handle(chg, data);
      const newSample = { name: 'Ring|Num', status: 'OK',
        aspect: { name: 'Num'} };
      chg = { 'sample.update': { new : newSample } };
      RealtimeChangeHandler.handle(chg, data);

      /*
       * make sure that the samples instance object of the subjectGroup is
       * updated
       */
      expect(Object.keys(data.map.ring.samples)).to.have.lengthOf(2);
      expect(data.map.ring.samples['ring|color']).to.eq(sample);
      expect(data.map.ring.samples['ring|num']).to.eq(newSample);

      /*
       * make sure that the subjects instance object of the subjectGroup has
       * the new sample added
       */
      expect(data.map.ring.subjects.ring.samples).to.have.lengthOf(2);
      expect(data.map.ring.subjects.ring.samples[0]).to.eql(sample);
      expect(data.map.ring.subjects.ring.samples[1]).to.eql(newSample);
     });
  });

  describe('handle: validateData >', () => {
    it('instance of wrong class', () => {
      expect(() => RealtimeChangeHandler.handle({}, new SubjectGroup('x')))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "data"/);
    });

    it('object with no attributes', () => {
      expect(() => RealtimeChangeHandler.handle({}, {}))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "data"/);
    });

    it('null', () => {
      expect(() => RealtimeChangeHandler.handle({}, null))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "data"/);
    });

    it('undefined', () => {
      expect(() => RealtimeChangeHandler.handle({}, undefined))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "data"/);
    });

    it('array', () => {
      expect(() => RealtimeChangeHandler.handle({}, []))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "data"/);
    });
  });

  describe('handle - validateChg >', () => {
    const data = new SubjectGroups(sgArgs);

    it('no attributes', () => {
      expect(() => RealtimeChangeHandler.handle({}, data))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "chg"/);
    });

    it('null', () => {
      expect(() => RealtimeChangeHandler.handle(null, data))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "chg"/);
    });

    it('undefined', () => {
      expect(() => RealtimeChangeHandler.handle(undefined, data))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "chg"/);
    });

    it('array', () => {
      expect(() => RealtimeChangeHandler.handle([], data))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "chg"/);
    });

    it('sample.update missing new', () => {
      const chg = { 'sample.update': { name: 'a.b|c' } };
      expect(() => RealtimeChangeHandler.handle(chg, data))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "chg"/);
    });

    it('subject.update missing new', () => {
      const chg = { 'subject.update': { absolutePath: 'a.b' } };
      expect(() => RealtimeChangeHandler.handle(chg, data))
      .to.throw(/MultiTable|RealtimeChangeHandler.handle|Invalid arg "chg"/);
    });

    it('sample.update with new', () => {
      const chg = {
        'sample.update': {
          new: {
            name: 'a|c',
            value: '0',
            aspect: {
              name: 'c',
            }
          },
        },
      };
      expect(() => RealtimeChangeHandler.handle(chg, data))
      .not.to.throw(Error);
    });

    it('subject.update with new', () => {
      const chg = {
        'subject.update': {
          new: {
            absolutePath: 'a',
            description: 'x',
          },
        },
      };
      expect(() => RealtimeChangeHandler.handle(chg, data))
      .not.to.throw(Error);
    });
  });

  describe('handle: addSubject >', () => {
    let data;
    const hierarchy = {
      absolutePath: 'root',
      parentAbsolutePath: '',
      name: 'root',
      children: [{
        absolutePath: 'root.s1',
        parentAbsolutePath: 'root',
        name: 's1',
        children: [{
          absolutePath: 'root.s1.s2',
          parentAbsolutePath: 'root.s1',
          name: 's2',
        }],
      }],
    };

    beforeEach(() => {
      data = new SubjectGroups(hierarchy);
    });

    function getGroup(absPath) {
      return data.map[absPath];
    }

    function getSubject(subject) {
      const subjectGroup = data.map[subject.parentAbsolutePath.toLowerCase()];
      if (subjectGroup) {
        return subjectGroup.subjects[subject.absolutePath.toLowerCase()];
      }
    }

    it('basic add', () => {
      const subject = {
        absolutePath: 'root.s1.s3',
        parentAbsolutePath: 'root.s1',
        name: 's3',
      };

      expect(getSubject(subject)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': subject}, data);
      expect(getSubject(subject)).to.exist;
    });

    it('add under root', () => {
      const subject = {
        absolutePath: 'root.s3',
        parentAbsolutePath: 'root',
        name: 's3',
      };

      expect(getSubject(subject)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': subject}, data);
      expect(getSubject(subject)).to.exist;
    });

    it('add outside of root - not added', () => {
      const subject = {
        absolutePath: 's3',
        parentAbsolutePath: '',
        name: 's3',
      };

      expect(getGroup(subject.parentAbsolutePath)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': subject}, data);
      expect(getGroup(subject.parentAbsolutePath)).to.not.exist;
    });


    it('no existing parent subject - not added', () => {
      const subject = {
        absolutePath: 'root.s3.s4',
        parentAbsolutePath: 'root.s3',
        name: 's4',
      };

      expect(getGroup(subject.parentAbsolutePath)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': subject}, data);
      expect(getGroup(subject.parentAbsolutePath)).to.not.exist;
    });

    it('existing parent with no children (no group)', () => {
      const subject = {
        absolutePath: 'root.s1.s2.s3',
        parentAbsolutePath: 'root.s1.s2',
        name: 's3',
      };

      expect(getGroup(subject.parentAbsolutePath)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': subject}, data);
      expect(getGroup(subject.parentAbsolutePath)).to.exist;
      expect(getSubject(subject)).to.exist;
    });

    it('existing root with no children', () => {
      const hierarchy = {
        absolutePath: 'root',
        parentAbsolutePath: '',
        name: 'root',
      };
      data = new SubjectGroups(hierarchy);
      const subject = {
        absolutePath: 'root.s1',
        parentAbsolutePath: 'root',
        name: 's1',
      };

      expect(getGroup(subject.parentAbsolutePath)).to.exist;
      expect(getSubject(subject)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': subject}, data);
      expect(getSubject(subject)).to.exist;
    });


    it('remove then add back', () => {
      const subject = {
        absolutePath: 'root.s1.s2',
        parentAbsolutePath: 'root.s1',
        name: 's2',
      };

      expect(getSubject(subject)).to.exist;
      RealtimeChangeHandler.handle({'subject.remove': subject}, data);
      expect(getGroup(subject.parentAbsolutePath)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': subject}, data);
      expect(getSubject(subject)).to.exist;
    });

    it('remove root subject, then add back', () => {
      const root = {
        absolutePath: 'root',
        parentAbsolutePath: '',
        name: 'root',
      };
      const s1 = {
        absolutePath: 'root.s1',
        parentAbsolutePath: 'root',
        name: 's1',
      };
      const newRoot = {
        absolutePath: 'root',
        parentAbsolutePath: 'root',
        name: 'root',
      };

      expect(getGroup(root.absolutePath)).to.exist;
      expect(getSubject(s1)).to.exist;
      RealtimeChangeHandler.handle({'subject.remove': root}, data);
      expect(getGroup(root.parentAbsolutePath)).to.not.exist;
      expect(getGroup(root.absolutePath)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': root}, data);
      expect(getGroup(root.absolutePath)).to.exist;
      expect(getSubject(newRoot)).to.exist;
      expect(getSubject(s1)).to.not.exist;
    });

    it('lone root subject - remove root then add back', () => {
      const root = {
        absolutePath: 'root',
        parentAbsolutePath: '',
        name: 'root',
      };
      const newRoot = {
        absolutePath: 'root',
        parentAbsolutePath: 'root',
        name: 'root',
      };
      data = new SubjectGroups(root);

      expect(getGroup(root.parentAbsolutePath)).to.not.exist;
      expect(getGroup(root.absolutePath)).to.exist;
      RealtimeChangeHandler.handle({'subject.remove': root}, data);
      expect(getGroup(root.parentAbsolutePath)).to.not.exist;
      expect(getGroup(root.absolutePath)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': root}, data);
      expect(getGroup(root.absolutePath)).to.exist;
      expect(getSubject(newRoot)).to.exist;
    });

    it('lens root not hierarchy root - remove and add back', () => {
      const lensRoot = {
        absolutePath: 'root.lensRoot',
        parentAbsolutePath: 'root',
        name: 'lensRoot',
      };
      data = new SubjectGroups(lensRoot);

      expect(getGroup(lensRoot.parentAbsolutePath)).to.exist;
      expect(getSubject(lensRoot)).to.exist;
      RealtimeChangeHandler.handle({'subject.remove': lensRoot}, data);
      expect(getGroup(lensRoot.parentAbsolutePath)).to.not.exist;
      expect(getSubject(lensRoot)).to.not.exist;
      RealtimeChangeHandler.handle({'subject.add': lensRoot}, data);
      expect(getGroup(lensRoot.parentAbsolutePath)).to.exist;
      expect(getSubject(lensRoot)).to.exist;
    });
  });
});
