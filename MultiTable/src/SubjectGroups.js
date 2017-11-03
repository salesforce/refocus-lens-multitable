/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * ./MultiTable/src/SubjectGroups.js
 */
'use strict';
const d3c = require('./lib/d3-collection.v1.min.js');
const SubjectGroup = require('./SubjectGroup');
const Utils = require('./Utils');

/*
 * Return the absolutePath one level up from the absolutePath or sample name
 * specified. Just the first part of the condition is required, other probably not
 */
function deriveGroupName(key) {
  return key.split('.').slice(0, -1).join('.') || key.split('|')[0] || key;
} // deriveGroupName

/**
 * Converts the hierarchy JSON to an associative array of SubjectGroups keyed
 * by name. The subjectgroup is created only if the subject has a list of
 * child subjects.
 *
 * @param {JSON} json - the subject/sample hierarchy
 * @returns {Object} - an associative array of SubjectGroups keyed by name
 */
function jsonToSubjectGroups(json) {
  if (!json) {
    return {};
  }

  const groups = {};
  const inv = Utils.inventory(json);

  // Add Subjects
  d3c.values(inv.subjects).forEach((s) => {
    if (!s.samples) s.samples = [];
    const grpName = deriveGroupName(s.absolutePath);
    if (!groups[grpName.toLowerCase()]) {
      groups[grpName.toLowerCase()] = new SubjectGroup(grpName,
        inv.subjects[grpName.toLowerCase()]);
    }
    /*
     * The subjects are added to the subjetGroup one level up the hierarchy.
     * for e.g if the subject is 'US.CA.SFO', the subject will be added to the
     * USA.CA subject group.
     */
    groups[grpName.toLowerCase()].addSubject(s);
  });

  // Add Samples. Ignore sample if its name is invalid.
  d3c.values(inv.samples).forEach((s) => {
    const grpName = deriveGroupName(s.name);
    try {
      /*
       * The samples are added to the subjetGroup one level up the hierarchy.
       * for e.g if the sample is 'US.CA.SFO|delay', the samples is added to the
       * USA.CA subject group.
       */
      groups[grpName.toLowerCase()].addSample(s);
    } catch (e) {
      console.log(e); // NO-OP InvalidSampleNameException
    }
  });
  return groups;
} // jsonToSubjectGroups

module.exports = class SubjectGroups {
  /**
   * Return the absolutePath one level up from the absolutePath or sample name
   * specified.
   *
   * @param {String} key - a sample.name or subject.absolutePath
   * @returns {String} the absolutePath of the parent of the given sample or
   *  subject, or the absolutePath of the subject if it has no parent.
   */
  static groupName(key) {
    return deriveGroupName(key);
  } // groupName

  constructor(jsonHierarchy) {
    this.map = jsonToSubjectGroups(jsonHierarchy);
    this.rootSubject = jsonHierarchy.absolutePath;
    this.splitGroupMap = {};
    this.showAll = false;
  } // constructor

  reset(showAll) {
    this.showAll = showAll;
    d3c.keys(this.map).forEach((name) => {
      this.map[name.toLowerCase()].reset(showAll);
    });
  } // reset

  getPanelsToDraw() {
    const allPanels = d3c.values(this.map);
    const panelsToShow = allPanels
      .filter(SubjectGroup.hasAspectsAndSubjectsToShow)
      .sort(SubjectGroup.nameSorter);
    return panelsToShow;
  } // getPanelsToDraw

  groupList() {
    return d3c.values(this.map);
  } // groupList

  getSortedGroupList() {
    return this.groupList().sort(SubjectGroup.nameSorter);
  } // getSortedGroupList

  getNextGroup(group) {
    if (!group || !group.split) return null;
    const nextGroupNum = group.splitNum + 1;
    const key = group.name.toLowerCase() + '-' + nextGroupNum;
    return this.map[key];
  } // getNextGroup

  getParentGroupForAbsolutePath(absolutePath) {
    absolutePath = absolutePath.toLowerCase().split('|')[0];
    const splitGroup = this.splitGroupMap[absolutePath];
    const normalGroup = this.map[deriveGroupName(absolutePath)];
    return splitGroup || normalGroup;
  } // getParentGroupForAbsolutePath

  getSelfGroupsForAbsolutePath(absolutePath) {
    absolutePath = absolutePath.split('|')[0];
    return this.groupList().filter((group) => (group.name === absolutePath));
  } // getSelfGroupsForAbsolutePath

  findGroupForNewSubject(subjectToAdd) {
    const groupName = deriveGroupName(subjectToAdd.absolutePath);
    const splitGroups = this.getSortedGroupList().filter(g => (g.name === groupName));
    let group = this.map[groupName];
    if (group) return group;
    for (group of splitGroups) {
      const lastInGroup = group.getSortedSubjectList().pop();
      if (!lastInGroup) continue;
      const comparison = SubjectGroup.subjectSorter(subjectToAdd, lastInGroup);
      if (comparison <= 0) break;
    }

    return group;
  } // findGroupForNewSubject

  addSubjectGroup(name, subject, showAll = this.showAll, splitNum) {
    const newGroup = new SubjectGroup(name, subject, showAll, splitNum);
    this.map[newGroup.key] = newGroup;
    return newGroup;
  } // addSubjectGroup

  splitSubjectGroup(group) {
    if (!group.split) {
      group.splitNum = 1;
      group.split = true;
      delete this.map[group.key];
      group.key += '-1';
      this.map[group.key] = group;
      group.subjectList().forEach((subject) => {
        this.trackSubject(subject, group);
      });
    }

    const nextGroupNum = group.splitNum + 1;
    return this.addSubjectGroup(group.name, group.self, group.showAll, nextGroupNum);
  } // splitSubjectGroup

  addSubject(group, subject) {
    group.addSubject(subject);
    if (group.split) {
      this.trackSubject(subject, group);
    }
  } // addSubject

  removeSubject(group, subject) {
    group.removeSubject(subject);
    if (group.split) {
      this.trackSubject(subject, null);
    }
  } // removeSubject

  trackSubject(subject, group) {
    const key = subject.absolutePath.toLowerCase();
    this.splitGroupMap[key] = group;
  } // trackSubject

  moveSubject(subject, fromGroup, toGroup) {
    this.removeSubject(fromGroup, subject);
    this.addSubject(toGroup, subject);
    subject.samples.forEach((s) => {
      fromGroup.removeSample(s);
      toGroup.addSample(s);
    });
  } // moveSubject

  removeGroup(group) {
    delete this.map[group.key];
  } // removeGroup

  removeEmptyGroups() {
    this.groupList()
    .filter(group => group.isEmpty())
    .forEach(group => delete this.map[group.key]);
  } // removeEmptyGroups

}; // module.exports
