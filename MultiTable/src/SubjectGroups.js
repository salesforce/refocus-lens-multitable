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

  getSubjectGroup(key) {
    return this.map[key.toLowerCase()];
  } // getSubjectGroup

  hasSubjectGroup(key) {
    return d3c.keys(this.map).includes(key.toLowerCase());
  } // hasSubjectGroup

  addSubjectGroup(name, subject) {
    this.map[name.toLowerCase()] = new SubjectGroup(name, subject);
  } // addSubjectGroup

} // module.exports
