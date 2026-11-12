import { describe, expect, it } from "vitest";
import { weeklyHours } from "./contact";

describe("weeklyHours", () => {
  it("shows nothing until hours are entered", () => {
    expect(weeklyHours([])).toEqual([]);
  });

  it("lists every weekday, joins breaks and marks closed days", () => {
    const rows = [
      { weekday: 1, opens_at: "09:00:00", closes_at: "12:30:00" },
      { weekday: 1, opens_at: "13:30:00", closes_at: "19:00:00" },
      { weekday: 6, opens_at: "10:00:00", closes_at: "16:00:00" },
    ];
    const week = weeklyHours(rows);
    expect(week).toHaveLength(7);
    expect(week[0]).toEqual({ day: "Pazartesi", hours: "09:00–12:30, 13:30–19:00" });
    expect(week[1]).toEqual({ day: "Salı", hours: "Kapalı" });
    expect(week[5]).toEqual({ day: "Cumartesi", hours: "10:00–16:00" });
    expect(week[6]).toEqual({ day: "Pazar", hours: "Kapalı" });
  });
});
