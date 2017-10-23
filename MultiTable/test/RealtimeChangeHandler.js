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
    expect(data instanceof SubjectGroups).to.equal.true;
    expect(data).to.have.property('rootSubject', 'a');
    expect(data.map).to.have.property('a');
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
