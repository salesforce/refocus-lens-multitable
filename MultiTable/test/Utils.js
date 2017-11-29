/**
 * test/Utils.js
 */
'use strict';
const expect = require('chai').expect;
const Utils = require('../src/Utils');
const airportHierarchy = require('./test-us-airport-hierarchy');

describe('./test/Utils.js >', () => {
  describe('sortByNameAscending', () => {
    it('good', () => {
      const arr = [
        { name: 'x|y' },
        { name: 'a|y' },
        { name: 'X|a' },
        { name: 'a|a' },
      ];
      arr.sort(Utils.sortByNameAscending);
      expect(arr[0].name).to.equal('a|a');
      expect(arr[1].name).to.equal('a|y');
      expect(arr[2].name).to.equal('X|a');
      expect(arr[3].name).to.equal('x|y');
    });
  }); // sortByNameAscending

  describe('inventory', () => {
    it('for subjects, the children field is not returned', () => {
      const subject = { absolutePath: 'x', children: [{ absolutePath: 'x.x'}] };
      const inv = Utils.inventory(subject);
      expect(inv.subjects['x'].children).to.be.undefined;
      expect(inv.subjects['x.x'].children).to.be.undefined;
    });

    it('should contain all the subjects and the samples keyed off ' +
      'of absolutepath/name', () => {
      const inv = Utils.inventory(airportHierarchy);
      expect(inv).to.have.property('samples');
      expect(inv).to.have.property('subjects');
      const samples = Object.keys(inv.samples);
      const subjects = Object.keys(inv.subjects);
      expect(samples).to.include.members(['usa.ca.sfo|delay',
        'usa.ca.sfo.hyd|delay', 'usa.maine|delay', 'usa.ma.bos|delay']);
      expect(subjects).to.include.members(['usa', 'usa.ca', 'usa.ca.sfo',
        'usa.ca.sfo.hyd', 'usa.maine', 'usa.ma', 'usa.ma.bos']);
    });

    it('should return empty samples and subjects for an empty object', () => {
      const inv = Utils.inventory({});
      expect(inv).to.have.property('samples');
      expect(inv).to.have.property('subjects');
      const samples = Object.keys(inv.samples);
      const subjects = Object.keys(inv.subjects);
      expect(Object.keys(inv.samples)).to.have.length(0);
      expect(Object.keys(inv.subjects)).to.have.length(0);
    });

    it('samples object should be empty for hierarchy without samples', () => {
      const hierarchy = {
        absolutePath: 'USA',
        name: 'USA',
        children: [
          {
            absolutePath: 'USA.CA',
            name: 'CA',
         }],
      }
      const inv = Utils.inventory(hierarchy);
      expect(inv).to.have.property('samples');
      expect(inv).to.have.property('subjects');
      expect(Object.keys(inv.samples)).to.have.length(0);
      expect(Object.keys(inv.subjects)).to.have.length(2);
      expect(Object.keys(inv.subjects)).to.include.members(['usa', 'usa.ca'])
    });
  }); // inventory
}); // Utils
