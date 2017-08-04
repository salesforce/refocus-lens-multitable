'use strict';

require('./lens.css');

require('script!./lib/jquery.min.js'); // for bootstrap
require('script!./lib/tether.min.js'); // for bootstrap tooltips
require('./lib/bootstrap.min.js'); // for bootstrap
require('./lib/bootstrap.min.css'); // bootstrap
const moment = require('moment');
const tz = require('moment-timezone');

const conf = require('./config.json');

const SampleUtils = require('./SampleUtils');
const Utils = require('./Utils');

require('../../../Helpers/multiline.js');
const handlebars = require('handlebars-template-loader/runtime');

const template = {
  awesome: require('./template/awesome.handlebars'),
  pageHeader: require('./template/pageHeader.handlebars'),
  progress: require('./template/progress.handlebars'),
  sampleModal: require('./template/modal-sample.handlebars'),
  subjectGroup: require('./template/subject-group.handlebars'),
  subjectModal: require('./template/modal-subject.handlebars'),
  aspectModal: require('./template/modal-aspect.handlebars'),
};

const RealtimeChangeHandler = require('./RealtimeChangeHandler');
const SubjectGroups = require('./SubjectGroups');

const LENS = document.getElementById('lens');

let data;

let awesome;
let lastUpdatedMoment;
let lastUpdatedAt;
let lastUpdatedAtRelative;
let loading;
let mt;
let sampleModal;
let subjectModal;
let aspectModal;
let urlParams = {};

// for (ctrl + f) or (cmd + f)
window.onkeydown = function(e) {
  if (ga && e.keyCode == 70 && (e.ctrlKey || e.metaKey)) {
    ga('send', 'event', 'Lens - Multitable', 'Search Command');
  }
}

LENS.addEventListener('refocus.lens.load', () => {
  LENS.addEventListener('refocus.lens.hierarchyLoad', onHierarchyLoad);
  document.getElementById('errorInfo').setAttribute('hidden', 'true');
  LENS.className = LENS.className + ' container-fluid';

  // Parse the url parameters
  let query = window.location.search;
  let params = query.replace('?', '').split('&');
  params.forEach((param) => {
    let [key, value] = param.split('=');
    if (key === 'showAll')
      value = (value === 'true');
    urlParams[key] = value;
  });

  // Add page header to the page
  const ph = conf.pageHeader;
  lastUpdatedMoment = moment.tz([], moment.tz.guess());
  ph.lastUpdated.date = lastUpdatedMoment.format(conf.dateFormatString);
  ph.lastUpdated.relative = lastUpdatedMoment.fromNow();
  ph.legend.blink.threshold = conf.blinkIfNewStatusThresholdMillis / 60000;
  ph.showAll.checked = urlParams.showAll;
  LENS.insertAdjacentHTML('beforeend', template.pageHeader(ph));
  lastUpdatedAt = document.getElementById('last-updated-at');
  lastUpdatedAtRelative = document.getElementById('last-updated-at-relative');

  // Add progress bar to display while waiting to receive the hierarchy.
  LENS.insertAdjacentHTML('beforeend', template.progress(conf.progress));
  loading = document.getElementById('loading');

  // Add a component to show if everything's OK.
  LENS.insertAdjacentHTML('beforeend', template.awesome(conf.awesome));
  awesome = document.getElementById('awesome');

  // Add the subject, aspect, and sample modals.
  LENS.insertAdjacentHTML('beforeend', '<div id="modal-sample" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="gridModalLabel" aria-hidden="true">');
  sampleModal = document.getElementById('modal-sample');
  LENS.insertAdjacentHTML('beforeend', '<div id="modal-subject" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="gridModalLabel" aria-hidden="true">');
  subjectModal = document.getElementById('modal-subject');
  LENS.insertAdjacentHTML('beforeend', '<div id="modal-aspect" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="gridModalLabel" aria-hidden="true">');
  aspectModal = document.getElementById('modal-aspect');

  // Add the container which holds the tables.
  LENS.insertAdjacentHTML('beforeend', '<div id="multi-table-container" class="row"></div>');
  mt = document.getElementById('multi-table-container');

  // Initialize bootstrap tooltips.
  $(() => $('[data-toggle="tooltip"]').tooltip());
});

/**
 * Send event to google analytics
 *
 * @param {String} action: ie. ' click subject', 'click aspect', or 'Outbound Link'.
 * @param {String} label: ie. subjectAbsolutePath, aspectName, or mailto:addressHere
 */
function trackClick(action, label) {
  if (ga) {
    ga('send', 'event', 'Lens - Multitable', action, label);
  }
}

/**
 * Handler for the refocus.lens.hierarchyLoad event.
 * (1) Transform the hierarhcy into a data structure which is optimized for
 *     this multi-table layout.
 * (2) Enqueue the draw event.
 * (3) Hide the "Loading..." indicator.
 *
 * @param {CustomEvent} evt - The refocus.lens.hierarchyLoad event.
 */
function onHierarchyLoad(evt) {
  data = new SubjectGroups(evt.detail);

  LENS.addEventListener('refocus.lens.realtime.change', onRealtimeChange);
  LENS.addEventListener('draw', onDraw);
  window.addEventListener('resize', onResize);
  window.setInterval(() => blinkChecker, conf.blinkerCheckIntervalMillis);

  let showAll = $('#toggle-show-all').prop('checked');
  if (showAll) data.reset(showAll);

  $('#toggle-show-all').change((evt) => {
    if (evt.target.checked == true) {
      trackClick('check', 'Show All');
    } else {
      trackClick('uncheck', 'Show All');
    }

    data.reset(evt.target.checked);
    enqueueDrawEvent();
  });

  enqueueDrawEvent();
  loading.setAttribute('hidden', 'true');

  window.setInterval(() => {
    lastUpdatedAtRelative.firstChild.nodeValue =
      `(${lastUpdatedMoment.fromNow()})`;
  }, 1000);
} // onHierarchyLoad

/**
 * Handler for refocus.lens.realtime.change event.
 * (1) Update the page header's last udpated time.
 * (2) Iterate over each change in this batch of changes, updating the
 *     SubjectGroups data structure for each change.
 * (3) Once the whole batch of changes has been processed, enqueue the draw
 *     event.
 *
 * @param {CustomEvent} evt - The refocus.lens.realtime.change event.
 */
function onRealtimeChange(evt) {
  lastUpdatedMoment = moment.tz([], moment.tz.guess());
  lastUpdatedAt.firstChild.nodeValue =
    lastUpdatedMoment.format(conf.dateFormatString);
  if (Array.isArray(evt.detail) && evt.detail.length > 0) {
    evt.detail.forEach((chg) => RealtimeChangeHandler.handle(chg, data));
    enqueueDrawEvent();
  }
} // onRealtimeChange

/**
 * Sweeps through all the blinking cells checking whether any cell should stop
 * blinking (i.e. if the elapsed time since the status changed exceeds the
 * configured threshold).
 */
function blinkChecker() {
  const blinkers = mt.querySelectorAll('.blink');
  for (let i = 0; i < blinkers.length; i++) {
    const cell = blinkers[i];
    const sample = data.getParentGroupForAbsolutePath(cell.id)
      .samples[cell.id.toLowerCase()];
    if (sample && SampleUtils.statusChangedRecently(sample,
      conf.blinkIfNewStatusThresholdMillis)) {
      cell.className = cell.className.replace(/blink blink-\w+/, '');
    }
  }
} // blinkChecker

function enqueueDrawEvent() {
  LENS.dispatchEvent(new CustomEvent('draw'));
}

function onDraw() {
  doDraw();
  splitAndDraw();
} // onDraw

let resizeWaiting = false;

function onResize() {
  if (resizeWaiting) return;
  resizeWaiting = true;
  setTimeout(() => {
    splitAndDraw();
    resizeWaiting = false;
  }, 50);
} // onResize

function splitAndDraw() {
  splitOverflowingGroups() && doDraw();
  if (scrollbarToggled) {
    splitOverflowingGroups() && doDraw();
  }
} // splitAndDraw

/**
 * This function modifies the DOM.
 */
let scrollbarToggled;

function doDraw() {
  const widthBeforeDraw = mt.clientWidth;
  const panels = preparePanelsToDraw();
  mt.innerHTML = '';
  if (panels.length) {
    awesome.setAttribute('hidden', true);
    panels.forEach((p) => {
      mt.insertAdjacentHTML('beforeend', p.template);
      setSampleListeners(p.subjectGroup);
      setSubjectListeners(p.subjectGroup);
      setAspectListeners(p.subjectGroup);
    });
  } else {
    awesome.removeAttribute('hidden');
  }

  const widthAfterDraw = mt.clientWidth;
  scrollbarToggled = (widthAfterDraw != widthBeforeDraw);
} // doDraw

function preparePanelsToDraw() {
  return data.getPanelsToDraw().map((subjectGroup) => {
    const ctx = subjectGroup.tableContext(data.rootSubject);
    return {
      subjectGroup: subjectGroup,
      template: template.subjectGroup(ctx),
    };
  });
} // getPanelsToDraw

function bindContentToModal(modal, modalTemplate, context, content) {
  context.data = content;
  const str = modalTemplate(context);
  modal.innerHTML = '';
  modal.insertAdjacentHTML('beforeend', str);

  // add event handlers to detect clickingo of links
  modal.querySelectorAll('a.list-group-item').forEach((link) => {
    link.addEventListener('click', (evt) => {
      trackClick('Outbound Link', evt.target.href);
    });
  });
} // bindContentToModal

function setSampleListeners(subjectGroup) {
  const samples = document.getElementById(subjectGroup.key)
    .querySelectorAll('.sample');
  samples.forEach((sample) => {
    sample.addEventListener('click', (evt) => {
      trackClick('click sample', evt.target.id);
      const s = subjectGroup.samples[evt.target.dataset.sampleId.toLowerCase()];
      s.updatedAtFormatted = moment.tz(s.updatedAt, moment.tz.guess()).format(conf.dateFormatString);
      s.statusChangedAtFormatted = moment.tz(s.statusChangedAt,
        moment.tz.guess()).format(conf.dateFormatString);
      if (s.aspect.tags && s.aspect.tags.length > 1) {
        s.aspect.tags.sort(Utils.sort);
      }

      if (s.relatedLinks && s.relatedLinks.length > 1) {
        s.relatedLinks.sort(Utils.sortByNameAscending);
      }

      bindContentToModal(sampleModal, template.sampleModal,
        conf.modal.sample, s);
      $('#modal-sample').modal(); // open the modal
    });
  });
} // setSampleListeners

function setSubjectListeners(subjectGroup) {
  const subjects = document.getElementById(subjectGroup.key)
    .querySelectorAll('.subject');
  subjects.forEach((subject) => {
    subject.addEventListener('click', (evt) => {
      const s = evt.target.dataset.subjectId.toLowerCase() ===
        subjectGroup.name.toLowerCase() ? subjectGroup.self :
        subjectGroup.subjects[evt.target.dataset.subjectId.toLowerCase()];
      trackClick('click subject', subject.getAttribute('data-subject-id'));
      s.updatedAtFormatted = moment.tz(s.updatedAt,
        moment.tz.guess()).format(conf.dateFormatString);
      if (s.tags && s.tags.length > 1) {
        s.tags.sort(Utils.sort);
      }

      if (s.relatedLinks && s.relatedLinks.length > 1) {
        s.relatedLinks.sort(Utils.sortByNameAscending);
      }

      bindContentToModal(subjectModal, template.subjectModal,
        conf.modal.subject, s);
      $('#modal-subject').modal(); // open the modal
    });
  });
} // setSubjectListeners

function setAspectListeners(subjectGroup) {
  const aspectElements = document.getElementById(subjectGroup.key)
    .querySelectorAll('.aspect');
  aspectElements.forEach((aspectElement) => {
    aspectElement.addEventListener('click', (evt) => {
      let aspectName = evt.target.innerHTML;
      trackClick('click aspect', aspectName);
      let aspect = subjectGroup.aspects[aspectName.toLowerCase()];

      if (aspect.tags && aspect.tags.length > 1) {
        aspect.tags.sort(Utils.sort);
      }

      bindContentToModal(aspectModal, template.aspectModal,
        conf.modal.aspect, aspect);
      $('#modal-aspect').modal(); // open the modal

    });
  });
} // setAspectListeners

handlebars.registerHelper('flattenRange', function(range) {
  if (range == null) {
    return null;
  } else if (range[0] == range[1]) {
    return range[0];
  } else {
    return range[0] + ' - ' + range[1];
  }
});

function splitOverflowingGroups() {
  const containerWidth = mt.clientWidth;
  let changed = false;
  let groupList = data.getSortedGroupList();

  for (const thisGroup of groupList) {
    const DOMGroup = document.getElementsByClassName('subject-group-' + thisGroup.name)[0];
    const notOverflowing = !thisGroup.split && ($(DOMGroup).outerWidth() < containerWidth);
    if (notOverflowing || !DOMGroup) continue;

    const aspectWidth = $(DOMGroup).find('th.aspect').outerWidth();
    const padding = $(DOMGroup).outerWidth() - $(DOMGroup).width();
    let groupWidth = aspectWidth + padding;

    let nextGroup = data.getNextGroup(thisGroup);
    thisGroup.reset();

    // search for overflowing subjects and move them to the next group
    for (const subject of thisGroup.getSortedSubjectList()) {
      const DOMSubject = document.getElementById(subject.absolutePath);
      const subjectWidth = (DOMSubject ? DOMSubject.getBoundingClientRect().width : 0);
      groupWidth += subjectWidth;
      if (groupWidth >= containerWidth) {
        if (!nextGroup) {
          nextGroup = data.splitSubjectGroup(thisGroup);
          groupList.push(nextGroup);
        }

        data.moveSubject(subject, thisGroup, nextGroup);
        changed = true;
      }
    }

    // search for subjects in the following groups that can be moved back to this group
    while (nextGroup) {
      for (const subject of nextGroup.getSortedSubjectList()) {
        const DOMSubject = document.getElementById(subject.absolutePath);
        const subjectWidth = (DOMSubject ? DOMSubject.getBoundingClientRect().width : 0);
        const extraSpace = containerWidth - groupWidth;
        if (subjectWidth < extraSpace) {
          data.moveSubject(subject, nextGroup, thisGroup);
          changed = true;
          groupWidth += subjectWidth;
        } else {
          nextGroup = null;
          break;
        }
      }

      nextGroup = data.getNextGroup(nextGroup);
    }

  }

  data.removeEmptyGroups();
  return changed;
}
