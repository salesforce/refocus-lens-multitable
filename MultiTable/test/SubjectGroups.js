/**
 * test/SubjectGroups.js
 */
'use strict';
const expect = require('chai').expect;
const SubjectGroups = require('../src/SubjectGroups');
const SubjectGroup = require('../src/SubjectGroup');
const hierarchy = require('./test-hierarchy');
const airportHierarchy = require('./test-us-airport-hierarchy');
const util = require('util');

describe('./test/SubjectGroups.js >', () => {
  describe('getParentGroupForAbsolutePath >', () => {
    const sg = new SubjectGroups(hierarchy);

    it('TypeError if absolutePath arg is undefined', () => {
      expect(() => sg.getParentGroupForAbsolutePath(undefined))
      .to.throw(TypeError);
    });

    it('TypeError if absolutePath arg is null', () => {
      expect(() => sg.getParentGroupForAbsolutePath(null))
      .to.throw(TypeError);
    });

    it('TypeError if absolutePath arg is object', () => {
      expect(() => sg.getParentGroupForAbsolutePath({}))
      .to.throw(TypeError);
    });

    it('TypeError if absolutePath arg is array', () => {
      expect(() => sg.getParentGroupForAbsolutePath([]))
      .to.throw(TypeError);
    });

    it('undefined if absolutePath arg is empty string', () => {
      expect(sg.getParentGroupForAbsolutePath('')).to.equal(undefined);
    });

    it('absolutePath arg is valid sample name', () => {
      const sgrp =
        sg.getParentGroupForAbsolutePath('Fellowship.Aragorn.JJ1.B52|OAUTH');
      expect(sgrp instanceof SubjectGroup).to.be.true;
      expect(sgrp).to.have.property('name', 'Fellowship.Aragorn.JJ1');
    });

    it('absolutePath arg is valid subject absolutePath', () => {
      const sgrp =
        sg.getParentGroupForAbsolutePath('Fellowship.Aragorn.JJ1.B52');
      expect(sgrp instanceof SubjectGroup).to.be.true;
      expect(sgrp).to.have.property('name', 'Fellowship.Aragorn.JJ1');
    });

    it('undefined if neither splitGroup nor normalGroup found for absolutePath', () => {
      const sgrp = sg.getParentGroupForAbsolutePath('a.bcd.efg');
      expect(sgrp).to.equal(undefined);
    });

    it('splitGroupMap does not contain a key for this absolutePath, ' +
    'should use normalGroup', () => {
      expect(sg.splitGroupMap).to.deep.equal({});
      const sgrp =
        sg.getParentGroupForAbsolutePath('Fellowship.Aragorn.JJ1.B52');
      expect(sgrp instanceof SubjectGroup).to.be.true;
      expect(sgrp).to.have.property('name', 'Fellowship.Aragorn.JJ1');
    });
  });

  describe('SubjectGroup maps >', () => {
    let sg;
    let grp;

    before(() => {
      sg = new SubjectGroups(airportHierarchy);
    });

    it('map should be empty when passed in an empty hierarchy', () => {
      const sgs = new SubjectGroups({});
      expect(sgs.map).to.deep.equal({});
    });

    it('map should contain subjectGroup instance keyed off of subject ' +
      'absolutePath. Subjects without children should not have subject group', () => {
      const sgs = new SubjectGroups(airportHierarchy);
      console.log(sg.map);
      const mapKeys = Object.keys(sgs.map);
      expect(mapKeys).to.include.members(['usa', 'usa.ca', 'usa.ca.sfo',
         'usa.ma']);
      mapKeys.forEach((key) => {
        expect(sg.map[key] instanceof SubjectGroup).to.be.true;
      })
    });

    it('map for hierarchy have just one subject in every level', () => {
      const bosSubject = JSON.parse(JSON.stringify(
        airportHierarchy.children[2].children[0]));
      const sgs = new SubjectGroups(bosSubject);
      expect(Object.keys(sgs.map)).to.include('usa.ma');
      expect(sgs.map['usa.ma'] instanceof SubjectGroup).to.be.true;
      const sg = sgs.map['usa.ma'];
      expect(sg.subjects['usa.ma.bos']).to.deep.equal(bosSubject);
    });
  });

  describe('getParentGroupForAbsolutePath with split group >', () => {
    let sg;
    let grp;

    before(() => {
      sg = new SubjectGroups(hierarchy);
      grp = sg.getParentGroupForAbsolutePath('Fellowship.Gandalf.JJ1');
      sg.splitSubjectGroup(grp);
    });

    it('map does not contain a key for the group name derived from this ' +
    'absolutePath, should use splitGroup', () => {
      const g = sg.getParentGroupForAbsolutePath('Fellowship.Gandalf.JJ1');
      expect(g).to.have.property('splitNum', 1);
      expect(g).to.have.property('split', true);
      expect(g).to.have.property('key', 'fellowship.gandalf-1');
      expect(sg.splitGroupMap).to.have.property('fellowship.gandalf.jj1');
      expect(sg.splitGroupMap['fellowship.gandalf.jj1'])
      .to.have.property('key', 'fellowship.gandalf-1');
      expect(sg.map).to.not.have.property('fellowship.gandalf');
    });
  });

  describe('SubjectGroups.groupName >', () => {
    const sgArgs = { absolutePath: 'a', name: 'a' };
    const sg = new SubjectGroups(sgArgs);

    it('TypeError if key is undefined', () => {
      expect(() => SubjectGroups.groupName(undefined)).to.throw(TypeError);
    });

    it('TypeError if key is null', () => {
      expect(() => SubjectGroups.groupName(null)).to.throw(TypeError);
    });

    it('TypeError if key is object', () => {
      expect(() => SubjectGroups.groupName({})).to.throw(TypeError);
    });

    it('TypeError if key is array', () => {
      expect(() => SubjectGroups.groupName([])).to.throw(TypeError);
    });

    it('TypeError if key is number', () => {
      expect(() => SubjectGroups.groupName(23)).to.throw(TypeError);
    });

    it('key is empty string', () => {
      expect(SubjectGroups.groupName('')).to.equal('');
    });

    it('key is string with no "." character and no "|" character', () => {
      expect(SubjectGroups.groupName('abc#DEF')).to.equal('abc#DEF');
    });

    it('key has leading "." character', () => {
      expect(SubjectGroups.groupName('.abc')).to.equal('.abc');
    });

    it('key has terminating "." character', () => {
      expect(SubjectGroups.groupName('abc.def.')).to.equal('abc.def');
    });

    it('key has non-leading and non-terminating "." character', () => {
      expect(SubjectGroups.groupName('abc.DEF')).to.equal('abc');
    });

    it('key has multiple consecutive "." characters', () => {
      expect(SubjectGroups.groupName('abc..DEF')).to.equal('abc.');
    });

    it('key has multiple non-consecutive "." characters', () => {
      expect(SubjectGroups.groupName('abc.DEF.ghi.JKL'))
      .to.equal('abc.DEF.ghi');
    });

    it('key has "." and |" character', () => {
      expect(SubjectGroups.groupName('abc.DEF.ghi|JKL'))
      .to.equal('abc.DEF');
    });

    it('key has "|" character but no "." character', () => {
      expect(SubjectGroups.groupName('abc|JKL'))
      .to.equal('abc');
    });

    it('key has multiple consecutive "|" characters', () => {
      expect(SubjectGroups.groupName('abc.DEF.ghi||JKL'))
      .to.equal('abc.DEF');
    });

    it('key has multiple non-consecutive "|" characters', () => {
      expect(SubjectGroups.groupName('abc.DEF.ghi|JKL|mno'))
      .to.equal('abc.DEF');
    });
  });

  describe('getPanelsToDraw >', () => {
    it('map is empty', () => {
      const sgArgs = { absolutePath: 'a', name: 'a' };
      const sg = new SubjectGroups({});
      expect(Object.keys(sg.map)).to.be.empty;
      expect(sg.getPanelsToDraw()).to.be.empty;
    });

    it('no aspects or subjects to show', () => {
      const sgArgs = {
        absolutePath: 'a',
        name: 'a',
        children: [
          {
            absolutePath: 'a.a',
            name: 'a',
          },
          {
            absolutePath: 'a.b',
            name: 'b',
            children: [
              {
                absolutePath: 'a.b.a',
                name: 'a',
              },
              {
                absolutePath: 'a.b.b',
                name: 'b',
              },
            ],
          },
        ],
      };
      const sg = new SubjectGroups(sgArgs);
      expect(sg.getPanelsToDraw()).to.be.empty;
    });

    it('showAll false (default state)', () => {
      const sg = new SubjectGroups(hierarchy);
      const panelsToDraw = sg.getPanelsToDraw().map((p) => p.name);
      const sortedPanels = panelsToDraw.slice().sort();
      expect(Object.keys(sg.map).length).to.equal(11);
      expect(panelsToDraw.length).to.equal(5);
      expect(sortedPanels).to.deep.equal(panelsToDraw);
    });

    it('showAll true', () => {
      const sg = new SubjectGroups(hierarchy);
      sg.reset(true);
      const panelsToDraw = sg.getPanelsToDraw().map((p) => p.name);
      const sortedPanels = panelsToDraw.slice().sort();
      expect(Object.keys(sg.map).length).to.equal(11);
      expect(panelsToDraw.length).to.equal(7);
      expect(sortedPanels).to.deep.equal(panelsToDraw);
    });
  });
});
