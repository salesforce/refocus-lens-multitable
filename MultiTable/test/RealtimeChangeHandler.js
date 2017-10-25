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
});
