/**
 * test/Utils.js
 */
'use strict';
const expect = require('chai').expect;
const Utils = require('../src/Utils');
const airportHierarchy = require('./test-us-airport-hierarchy');

describe('./test/Utils.js >', () => {
  describe('formatDate', () => {
    it('happy path, i.e. valid format string and valid date', () => {
      const str = 'mmm d yyyy, h:MM:ss TT Z';
      const d = '2016-05-27T23:11:19.467Z';
      expect(Utils.formatDate(str, d))
        .to.equal('May 27 2016, 4:11:19 PM PDT');
    });

    it('no date arg, assumes "now"', () => {
      const str = 'mmm d yyyy, h:MM:ss TT Z';
      expect(Utils.formatDate(str))
        .to.match(/^[A-Z][a-z]{2} \d{1,2} \d{4}, \d{1,2}:\d{2}:\d{2} [AP]M [A-Z]{3}$/);
    });

    it('format string with no formatting', () => {
      const str = 'abc';
      const d = '2016-05-27T23:11:19.467Z';
      expect(Utils.formatDate(str, d)).to.equal('abc');
    });

    it('Invalid Date');
  }); // formatDate

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
