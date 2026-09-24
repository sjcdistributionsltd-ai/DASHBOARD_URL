// PROTOTYPE sample leaderboard (made-up names and scores) across the four SJC Fuel sites.
(function () {
  const PEOPLE = [['Priya', 'Winnall'], ['Tom', 'Winnall'], ['Amira', 'Chandlers Ford'], ['Dan', 'Chandlers Ford'], ['Chloe', 'Eastleigh'], ['Sam', 'Eastleigh'], ['Leah', 'Ropley'], ['Omar', 'Ropley']];
  const R = { blitz: [48, 20], hangman: [7, 1], memory: [150, 90], goplus: [26, 12], racer: [26000, 45000], shelves: [14000, 30000], coffee: [14, 5], fuelup: [470, 260],
    till: [11, 4], scramble: [12, 4], quiz: [175, 80], wash: [9000, 20000], queue: [16, 6], stack: [24, 8], simon: [14, 5] };
  window.whSampleBoard = function (id) {
    const [a, b] = R[id] || [20, 5];
    return { board: PEOPLE.map(([n, site], i) => ({ n, site, s: Math.round(a + (b - a) * (i / 7) * (0.85 + ((i * 37) % 10) / 33)) })), boardTotal: 31, me: 'You', mySite: 'Winnall', boardName: 'SJC Fuel · all 4 sites · this week' };
  };
})();
