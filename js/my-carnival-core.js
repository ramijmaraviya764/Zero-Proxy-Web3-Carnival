/**
 * Web3 Carnival — My Carnival Core
 * Pure state and scheduling utilities shared by the dashboard and shell controls.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'w3c_my_carnival';
  const LEGACY_JOURNEY_KEY = 'w3c_my_journey';

  /**
   * Create the canonical empty My Carnival state.
   * @returns {{sessions: string[], speakers: string[], tracks: string[], profile: object}}
   */
  function createEmptyState() {
    return {
      sessions: [],
      speakers: [],
      tracks: [],
      profile: {
        name: '',
        email: '',
        role: '',
        organization: '',
        goal: '',
        passId: ''
      }
    };
  }

  /**
   * Return a de-duplicated, normalized ID array limited to a supplied set.
   * @param {unknown} value Candidate ID collection.
   * @param {Set<string>} allowedIds Valid IDs.
   * @returns {string[]} Safe ID collection.
   */
  function normalizeIds(value, allowedIds) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter(id => typeof id === 'string' && allowedIds.has(id)))];
  }

  /**
   * Load persisted state while migrating the existing My Journey storage key.
   * @param {Storage|null|undefined} storage Browser-compatible storage.
   * @param {object} data Web3 Carnival data object.
   * @returns {{sessions: string[], speakers: string[], tracks: string[], profile: object}}
   */
  function loadState(storage, data) {
    const empty = createEmptyState();
    if (!storage || !data) return empty;

    const sessionIds = new Set((data.sessions || []).map(item => item.id));
    const speakerIds = new Set((data.speakers || []).map(item => item.id));
    const trackIds = new Set((data.tracks || []).map(item => item.id));

    let parsed = {};
    try {
      const raw = storage.getItem(STORAGE_KEY);
      parsed = raw ? JSON.parse(raw) : {};
    } catch (error) {
      parsed = {};
    }

    let legacySessions = [];
    try {
      const rawLegacy = storage.getItem(LEGACY_JOURNEY_KEY);
      const parsedLegacy = rawLegacy ? JSON.parse(rawLegacy) : [];
      legacySessions = Array.isArray(parsedLegacy) ? parsedLegacy : [];
    } catch (error) {
      legacySessions = [];
    }

    const profile = parsed && typeof parsed.profile === 'object' && parsed.profile
      ? {
          ...empty.profile,
          name: typeof parsed.profile.name === 'string' ? parsed.profile.name : '',
          email: typeof parsed.profile.email === 'string' ? parsed.profile.email : '',
          role: typeof parsed.profile.role === 'string' ? parsed.profile.role : '',
          organization: typeof parsed.profile.organization === 'string' ? parsed.profile.organization : '',
          goal: typeof parsed.profile.goal === 'string' ? parsed.profile.goal : '',
          passId: typeof parsed.profile.passId === 'string' ? parsed.profile.passId : ''
        }
      : empty.profile;

    return {
      sessions: normalizeIds([...(parsed.sessions || []), ...legacySessions], sessionIds),
      speakers: normalizeIds(parsed.speakers, speakerIds),
      tracks: normalizeIds(parsed.tracks, trackIds),
      profile
    };
  }

  /**
   * Persist state and keep the legacy journey key synchronized.
   * @param {Storage|null|undefined} storage Browser-compatible storage.
   * @param {{sessions: string[], speakers: string[], tracks: string[], profile: object}} state Canonical state.
   * @returns {boolean} True when persistence succeeded.
   */
  function saveState(storage, state) {
    if (!storage) return false;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      storage.setItem(LEGACY_JOURNEY_KEY, JSON.stringify(state.sessions));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Toggle one item in a state collection without mutating the original array.
   * @param {string[]} ids Current IDs.
   * @param {string} id ID to toggle.
   * @returns {string[]} Updated IDs.
   */
  function toggleId(ids, id) {
    if (!Array.isArray(ids) || typeof id !== 'string' || !id) return Array.isArray(ids) ? [...ids] : [];
    return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
  }

  /**
   * Parse a session time range such as "09:00 – 09:45".
   * @param {string} timeLabel Time range.
   * @returns {{start:number,end:number}|null} Minute offsets from midnight.
   */
  function parseTimeRange(timeLabel) {
    if (typeof timeLabel !== 'string') return null;
    const matches = timeLabel.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
    if (!matches) return null;
    const start = Number(matches[1]) * 60 + Number(matches[2]);
    const end = Number(matches[3]) * 60 + Number(matches[4]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    return { start, end };
  }

  /**
   * Find all overlapping saved sessions grouped by day.
   * @param {object[]} sessions Session records.
   * @param {string[]} selectedIds Saved session IDs.
   * @returns {Array<{dayId:string, sessions:object[], minutes:number}>} Conflict groups.
   */
  function findConflicts(sessions, selectedIds) {
    const selected = (Array.isArray(sessions) ? sessions : [])
      .filter(session => Array.isArray(selectedIds) && selectedIds.includes(session.id))
      .map(session => ({ ...session, range: parseTimeRange(session.time) }))
      .filter(session => session.range);

    const groups = [];
    const byDay = new Map();

    selected.forEach(session => {
      if (!byDay.has(session.dayId)) byDay.set(session.dayId, []);
      byDay.get(session.dayId).push(session);
    });

    byDay.forEach((daySessions, dayId) => {
      const sorted = [...daySessions].sort((a, b) => a.range.start - b.range.start);
      for (let index = 0; index < sorted.length - 1; index += 1) {
        const current = sorted[index];
        const next = sorted[index + 1];
        if (next.range.start < current.range.end) {
          const overlap = current.range.end - next.range.start;
          const existing = groups.find(group => group.dayId === dayId && group.sessions.some(item => item.id === current.id));
          if (existing) {
            if (!existing.sessions.some(item => item.id === next.id)) existing.sessions.push(next);
            existing.minutes = Math.max(existing.minutes, overlap);
          } else {
            groups.push({ dayId, sessions: [current, next], minutes: overlap });
          }
        }
      }
    });

    return groups;
  }

  /**
   * Rank sessions against the user's saved tracks, speakers, registration profile,
   * and a chosen builder priority.
   * @param {object[]} sessions Session records.
   * @param {{tracks:string[],speakers:string[],profile:object}} state User state.
   * @param {{priority?:string,level?:string,trackIds?:string[]}} options Ranking preferences.
   * @returns {object[]} Sessions sorted by descending relevance.
   */
  function rankSessions(sessions, state, options = {}) {
    const selectedTrackIds = new Set([
      ...(state && Array.isArray(state.tracks) ? state.tracks : []),
      ...(state && state.profile && Array.isArray(state.profile.tracks) ? state.profile.tracks : []),
      ...(Array.isArray(options.trackIds) ? options.trackIds : [])
    ]);
    const selectedSpeakerIds = new Set(state && Array.isArray(state.speakers) ? state.speakers : []);
    const preferredLevel = typeof options.level === 'string' && options.level !== 'all' ? options.level : '';
    const priorityMap = {
      learn: new Set(['engineering', 'design', 'policy']),
      network: new Set(['culture', 'investing']),
      invest: new Set(['investing', 'policy']),
      build: new Set(['engineering', 'design', 'security'])
    };
    const preferredInterests = priorityMap[options.priority] || new Set();

    return (Array.isArray(sessions) ? sessions : [])
      .map(session => {
        let score = 0;
        if (selectedTrackIds.has(session.trackId)) score += 8;
        if (selectedSpeakerIds.has(session.speakerId)) score += 5;
        if (preferredLevel && session.level === preferredLevel) score += 3;
        if (preferredInterests.has(session.interest)) score += 4;

        return { ...session, recommendationScore: score };
      })
      .sort((a, b) =>
        b.recommendationScore - a.recommendationScore ||
        String(a.dayId).localeCompare(String(b.dayId)) ||
        String(a.time).localeCompare(String(b.time))
      );
  }

  /**
   * Build a non-overlapping schedule from ranked sessions.
   * @param {object[]} sessions Session records.
   * @param {{tracks:string[],speakers:string[],profile:object}} state User state.
   * @param {{priority?:string,level?:string,trackIds?:string[]}} options Builder settings.
   * @returns {object[]} Recommended, non-overlapping sessions.
   */
  function buildSchedule(sessions, state, options = {}) {
    const ranked = rankSessions(sessions, state, options);
    const chosen = [];
    const byDay = new Map();

    ranked.forEach(session => {
      const range = parseTimeRange(session.time);
      if (!range) return;
      const dayChosen = byDay.get(session.dayId) || [];
      const hasConflict = dayChosen.some(existing => {
        const existingRange = parseTimeRange(existing.time);
        return existingRange && range.start < existingRange.end && existingRange.start < range.end;
      });
      if (hasConflict) return;
      dayChosen.push(session);
      byDay.set(session.dayId, dayChosen);
      chosen.push(session);
    });

    return chosen.sort((a, b) => {
      const dayCompare = String(a.dayId).localeCompare(String(b.dayId));
      return dayCompare || parseTimeRange(a.time).start - parseTimeRange(b.time).start;
    });
  }

  /**
   * Escape an iCalendar text field.
   * @param {string} value Text.
   * @returns {string} Escaped text.
   */
  function escapeIcsText(value) {
    return String(value ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  /**
   * Build a deterministic iCalendar representation of sessions.
   * @param {object[]} sessions Session records.
   * @param {Record<string,object>} dayById Day metadata keyed by ID.
   * @param {{venue?:object,eventName?:string}} options Calendar options.
   * @returns {string} RFC 5545 compatible calendar text.
   */
  function buildIcs(sessions, dayById, options = {}) {
    const eventName = options.eventName || 'Web3 Carnival 2026';
    const venue = options.venue || {};
    const sorted = [...(Array.isArray(sessions) ? sessions : [])].filter(item => item && dayById[item.dayId] && parseTimeRange(item.time));

    const rows = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Web3 Carnival//My Carnival//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    const dayDates = { day1: '20261114', day2: '20261115', day3: '20261116' };

    sorted.forEach(session => {
      const range = parseTimeRange(session.time);
      const date = dayDates[session.dayId];
      if (!date) return;
      const startHour = String(Math.floor(range.start / 60)).padStart(2, '0');
      const startMinute = String(range.start % 60).padStart(2, '0');
      const endHour = String(Math.floor(range.end / 60)).padStart(2, '0');
      const endMinute = String(range.end % 60).padStart(2, '0');
      rows.push(
        'BEGIN:VEVENT',
        `UID:${escapeIcsText(session.id)}@web3carnival2026`,
        `DTSTAMP:20260101T000000Z`,
        `DTSTART;TZID=Asia/Singapore:${date}T${startHour}${startMinute}00`,
        `DTEND;TZID=Asia/Singapore:${date}T${endHour}${endMinute}00`,
        `SUMMARY:${escapeIcsText(session.title)}`,
        `DESCRIPTION:${escapeIcsText(session.description || '')}`,
        `LOCATION:${escapeIcsText([venue.name, venue.address].filter(Boolean).join(' · '))}`,
        'END:VEVENT'
      );
    });

    rows.push('END:VCALENDAR');
    return rows.join('\r\n');
  }

  const api = {
    STORAGE_KEY,
    LEGACY_JOURNEY_KEY,
    createEmptyState,
    normalizeIds,
    loadState,
    saveState,
    toggleId,
    parseTimeRange,
    findConflicts,
    rankSessions,
    buildSchedule,
    escapeIcsText,
    buildIcs
  };

  global.Web3CarnivalCore = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
