import assert from "node:assert/strict";
import { test } from "node:test";
import { eventHasEnded, eventRegistrationIsAvailable } from "../src/lib/club/event-timing.ts";

const base = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "فعالية",
  title_en: "Event",
  description: "وصف الفعالية",
  description_en: "Event description",
  images: [],
  date: "2026-10-06",
  eventTime: "13:00",
  durationMinutes: 120,
  status: "upcoming",
  eventRegistration: {
    enabled: true,
    nameEnabled: true,
    phoneEnabled: true,
    attendanceEnabled: true,
  },
};

test("event timing uses Asia/Hebron and closes at the configured end time", () => {
  assert.equal(eventHasEnded(base, new Date("2026-10-06T10:59:00Z")), false);
  assert.equal(eventHasEnded(base, new Date("2026-10-06T12:00:00Z")), true);
});

test("past status and past dates close registration", () => {
  assert.equal(eventRegistrationIsAvailable({ ...base, status: "past" }), false);
  assert.equal(
    eventHasEnded({ ...base, date: "2026-10-05" }, new Date("2026-10-06T08:00:00Z")),
    true,
  );
});

test("future enabled events stay open while disabled events remain closed", () => {
  const now = new Date("2026-10-06T08:00:00Z");
  assert.equal(eventRegistrationIsAvailable({ ...base, date: "2026-10-07" }, now), true);
  assert.equal(
    eventRegistrationIsAvailable(
      { ...base, eventRegistration: { ...base.eventRegistration, enabled: false } },
      now,
    ),
    false,
  );
});

test("legacy upcoming events without detailed timing keep their status-based behavior", () => {
  assert.equal(
    eventRegistrationIsAvailable({
      ...base,
      date: undefined,
      eventTime: undefined,
      durationMinutes: undefined,
    }),
    true,
  );
});
