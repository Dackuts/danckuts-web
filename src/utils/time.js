import { DateTime, Interval } from "luxon";

export function datesFromInterval(interval) {
  function* days(interval) {
    let cursor = interval.start.startOf("day");
    while (cursor <= interval.end) {
      yield cursor;
      cursor = cursor.plus({ days: 1 });
    }
  }

  const dates = [];
  for (var d of days(interval)) {
    dates.push(d);
  }
  return dates;
}

export function getDates(date) {
  const oDate = DateTime.fromISO(date);
  const startDate = DateTime.max(
    oDate.startOf("week").minus({ weeks: 1 }),
    DateTime.now()
  );
  const endDate = oDate.endOf("week");

  return datesFromInterval(Interval.fromDateTimes(startDate, endDate)).map(
    (d) => d.toFormat("yyyy-LL-dd")
  );
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
