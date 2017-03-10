'use strict';
const d3c = require('./lib/d3-collection.v1.min.js');
const SubjectGroup = require('./SubjectGroup');
const Utils = require('./Utils');

function deriveGroupName(key) {
  return key.split('.').slice(0, -1).join('.') || key.split('|')[0] || key;
} // deriveGroupName

/**
 * Converts the hierarchy JSON to an associative array of SubjectGroups keyed
 * by name.
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
    const grpName = deriveGroupName(s.absolutePath);
    if (!groups[grpName.toLowerCase()]) {
      groups[grpName.toLowerCase()] = new SubjectGroup(grpName,
        inv.subjects[grpName.toLowerCase()]);
    }

    groups[grpName.toLowerCase()].addSubject(s);
  });

  // Add Samples. Ignore sample if its name is invalid.
  d3c.values(inv.samples).forEach((s) => {
    const grpName = deriveGroupName(s.name);
    try {
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
  } // constructor

  reset(showAll) {
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

  getSortedGroupList() {
    return Object.values(this.map).sort(SubjectGroup.nameSorter);
  } // getSortedGroupList

  getNextGroup(group) {
    if (!group || !group.split) return null;
    const nextGroupNum = group.splitNum + 1;
    const key = group.name.toLowerCase() + '-' + nextGroupNum;
    return this.map[key];
  } // getNextGroup

  getGroupForAbsolutePath(absolutePath) {
    absolutePath = absolutePath.toLowerCase().split('|')[0];
    const splitGroup = this.splitGroupMap[absolutePath];
    const normalGroup = this.map[deriveGroupName(absolutePath)];
    return splitGroup || normalGroup;
  } // getGroupForAbsolutePath

  findGroupForNewSubject(subjectToAdd) {
    const groupName = deriveGroupName(subjectToAdd.absolutePath);
    const splitGroups = this.getSortedGroupList().filter(g => (g.name === groupName));
    let group = this.map[groupName];
    if (group) return group;
    for (group of splitGroups) {
      const lastInGroup = group.getSortedSubjectList().pop();
      if (!lastInGroup) continue;
      const comparison = Utils.sortByNameAscending(subjectToAdd, lastInGroup);
      if (comparison <= 0) break;
    }

    return group;
  } // findGroupForNewSubject

  addSubjectGroup(name, subject, showAll, splitNum) {
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
      Object.values(group.subjects).forEach((subject) => {
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

  removeEmptyGroups() {
    Object.values(this.map)
    .filter(group => !Object.keys(group.subjects).length)
    .forEach(group => delete this.map[group.key]);
  } // removeEmptyGroups

}; // module.exports
