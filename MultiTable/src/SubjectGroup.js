'use strict';
const d3c = require('./lib/d3-collection.v1.min.js');
const d3a = require('./lib/d3-array.v1.min.js');
const conf = require('./config.json');
const Utils = require('./Utils');
const SampleUtils = require('./SampleUtils');
const SubjectUtils = require('./SubjectUtils');

function ascendingCaseInsensitive(a, b) {
  return d3a.ascending(a.toLowerCase(), b.toLowerCase());
}

/**
 * Data structure for the MultiTable component.
 *
 * Subjects are grouped together under a common parent one level deep.
 * Each SubjectGroup contains the following data:
 *  {String} name - the group name, i.e. the absolutePath of the parent of the
 *                  subjects in the group
 *  {Boolean} showAll - boolean to determine whether to show all aspects and
 *                      subjects, or just those with samples with non-OK status
 *  {Object} samples - associative array of samples keyed by sample.name
 *  {Object} subjects - associative array of samples keyed by
 *                      subject.absolutePath
 *  {Set} aspectsToShow - set of aspects names to show, i.e. table rows
 *  {Set} subjectsToShow - set of subject absolutePaths to show, i.e. table
 *                         columns
 */
module.exports = class SubjectGroup {
  constructor(name, subject, showAll=false, splitNum) {
    this.name = name;
    this.splitNum = splitNum;
    this.split = (splitNum != null);
    this.self = subject;
    this.showAll = showAll;
    this.samples = {};
    this.subjects = {};
    this.aspectsToShow = new Set();
    this.subjectsToShow = new Set();
    this.key = name.toLowerCase();
    if (this.split) this.key += `-${splitNum}`;
  }

  static hasAspectsAndSubjectsToShow(sg) {
    sg.reset();
    return sg.aspectsToShow.size > 0 && sg.subjectsToShow.size > 0;
  }

  /**
   * @param {Object} s - the sample
   */
  trackSampleAspectAndSubject(s) {
    if (this.showAll || SampleUtils.isNotOK(s)) {
      const sampleNameSplit = SampleUtils.splitName(s.name);
      this.aspectsToShow.add(sampleNameSplit.aspect.name);
      this.subjectsToShow.add(sampleNameSplit.subject.absolutePath);
    }
  }

  /**
   * Add a sample to this SubjectGroup. If showAll is true OR if status is not
   * OK, then add this sample's aspect and subject to the aspectsToShow and
   * subjectsToShow sets, respectively.
   *
   * @param {Object} s - the sample to add
   */
  addSample(s) {
    this.samples[s.name.toLowerCase()] = s;
  }

  /**
   * Add a subject to this SubjectGroup.
   *
   * @param {Object} s - the subject to add
   */
  addSubject(s) {
    this.subjects[s.absolutePath.toLowerCase()] = s;
  }

  /**
   * Update the subject in this SubjectGroup.
   *
   * @param {Object} s - the subject to update
   */
  updateSubject(s) {
    this.subjects[s.absolutePath.toLowerCase()] = s;
  }

  /**
   * Remove the subject from this SubjectGroup.
   *
   * @param {Object} s - the subject to remove
   */
  removeSubject(s) {
    delete this.subjects[s.absolutePath.toLowerCase()];
  }

  /**
   * Reset the aspectsToShow and subjectsToShow sets based on the value of
   * showAll.
   *
   * @param {Boolean} showAll - true if the user wishes to see aspects (rows)
   *  and subjects (columns) for samples with status=OK
   */
  reset(showAll) {
    if (showAll != null) this.showAll = showAll;
    this.aspectsToShow = new Set();
    this.subjectsToShow = new Set();
    d3c.values(this.samples)
      .forEach((s) => this.trackSampleAspectAndSubject(s));
  }

  /**
   * Update the sample in this SubjectGroup and adjust the aspectsToShow and
   * subjectsToShow accordingly.
   *
   * @param {Object} s - the sample to update
   */
  updateSample(s) {
    this.samples[s.name.toLowerCase()] = s;
  }

  /**
   * Remove the sample from this SubjectGroup.
   *
   * @param {Object} s - the sample to remove
   */
  removeSample(s) {
    delete this.samples[s.name.toLowerCase()];
  }

  getSubjectForSample(sample) {
    const subjectPath = sample.name.split('|')[0].toLowerCase();
    return this.subjects[subjectPath];
  }

  tableContext(rootSubject) {
    const sbj = this.getSubjectsToShow();
    const headings = sbj.map((s) => (
      {
        absolutePath: s.absolutePath,
        name: s.name,
      }
    ));
    const asp = Array.from(this.aspectsToShow)
      .sort(ascendingCaseInsensitive);
    const rows = asp.map((a) => {
      const columns = sbj.map((s) => {
        const id = `${s.absolutePath}|${a}`;
        const sample = this.samples[id.toLowerCase()] || {
          isFake: true,
          messageCode: '',
          status: '',
        };
        const contents = {
          Critical: sample.messageCode || '',
          Warning: sample.messageCode || '',
          Info: sample.messageCode || '',
          OK: sample.messageCode || '',
          Timeout: conf.cell.Timeout,
          Invalid: conf.cell.Invalid,
        }[sample.status] || '';
        return {
          contents,
          id,
          status: sample.status,
          shouldBlink: !sample.isFake &&
            SampleUtils.statusChangedRecently(sample,
              conf.blinkIfNewStatusThresholdMillis),
        };
      });
      return {
        aspect: a,
        columns,
        id: `${this.key}|${a}`,
      };
    });
    let shortName;
    if (this.name.toLowerCase().indexOf(rootSubject.toLowerCase()) === 0) {
      if (this.name.toLowerCase() === rootSubject.toLowerCase()) {
        shortName = self.name;
      } else {
        shortName = this.name.slice(1 + rootSubject.length);
      }
    } else {
      shortName = self.name;
    }

    return {
      columnCount: 1 + headings.length,
      headings,
      name: this.name,
      rows,
      shortName,
      key: this.key,
    };
  }

  getSubjectsToShow() {
    return Array.from(this.subjectsToShow)
             .sort(ascendingCaseInsensitive)
             .map(s => this.subjects[s.toLowerCase()])
             .filter(s => s);
  }

  getSortedSubjectList() {
    return Object.keys(this.subjects)
      .sort(ascendingCaseInsensitive)
      .map(s => this.subjects[s]);
  }

  static nameSorter(a, b) {
    if (a.name === b.name) {
      return a.splitNum - b.splitNum;
    } else {
      return d3a.ascending(a.name, b.name);
    }
  }
};
