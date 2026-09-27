/**
 * Web3 Carnival — My Carnival Core Tests
 * Uses Node's built-in test runner; no third-party dependencies are required.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/my-carnival-core.js');

function createStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); }
  };
}

const sampleData = {
  sessions: [
    { id: 's1', title: 'State of the Ecosystem', description: 'A grounded look at shipping.', dayId: 'day1', time: '09:00 – 09:45', trackId: 'infra', speakerId: 'a' },
    { id: 's2', title: 'Treasury Governance', description: 'Governance patterns.', dayId: 'day1', time: '09:30 – 10:15', trackId: 'dao', speakerId: 'b' },
    { id: 's3', title: 'Institutional Liquidity', description: 'Allocator data.', dayId: 'day1', time: '10:30 – 11:15', trackId: 'defi', speakerId: 'c' },
    { id: 's4', title: 'ZK Security', description: 'ZK security patterns.', dayId: 'day2', time: '11:00 – 11:45', trackId: 'zk', speakerId: 'a' }
  ],
  speakers: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  tracks: [{ id: 'infra' }, { id: 'dao' }, { id: 'defi' }, { id: 'zk' }]
};

test('migrates the existing My Journey key into canonical state', () => {
  const storage = createStorage();
  storage.setItem(core.LEGACY_JOURNEY_KEY, JSON.stringify(['s1', 'unknown']));

  const state = core.loadState(storage, sampleData);

  assert.deepEqual(state.sessions, ['s1']);
  assert.deepEqual(state.speakers, []);
  assert.deepEqual(state.tracks, []);
});

test('detects overlapping saved sessions', () => {
  const conflicts = core.findConflicts(sampleData.sessions, ['s1', 's2', 's3']);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].minutes, 15);
  assert.deepEqual(conflicts[0].sessions.map(item => item.id), ['s1', 's2']);
});

test('rejects malformed time ranges rather than producing invalid schedule data', () => {
  assert.equal(core.parseTimeRange('not a time'), null);
  assert.equal(core.parseTimeRange('09:00 – 08:00'), null);
});

test('builds a conflict-free recommended schedule', () => {
  const state = { tracks: ['infra'], speakers: [], profile: {} };
  const schedule = core.buildSchedule(sampleData.sessions, state, { level: 'all', priority: 'learn' });

  const selectedIds = schedule.map(item => item.id);
  assert.ok(selectedIds.includes('s1'));
  assert.ok(selectedIds.includes('s3'));
  assert.ok(!(selectedIds.includes('s1') && selectedIds.includes('s2')));
});

test('builds a calendar file for saved sessions', () => {
  const ics = core.buildIcs(
    [sampleData.sessions[0]],
    { day1: { label: 'Day 1', dateLabel: 'Nov 14' } },
    { eventName: 'Web3 Carnival 2026', venue: { name: 'Marina Convergence Hall', address: '8 Bayfront Concourse' } }
  );

  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /SUMMARY:State of the Ecosystem/);
  assert.match(ics, /DTSTART;TZID=Asia\/Singapore:20261114T090000/);
  assert.match(ics, /END:VCALENDAR/);
});
