import { describe, expect, it } from "vitest";
import { formValues, toFieldErrors } from "./form-state";

describe("toFieldErrors", () => {
  it("keeps the first message per field", () => {
    expect(
      toFieldErrors([
        { path: ["email"], message: "first" },
        { path: ["email"], message: "second" },
        { path: ["phone"], message: "phone" },
        { path: [], message: "form" },
      ]),
    ).toEqual({ email: "first", phone: "phone", "": "form" });
  });
});

describe("formValues", () => {
  it("returns the text fields and drops Next's internal action fields and files", () => {
    const data = new FormData();
    data.set("name", "Sniff");
    data.set("$ACTION_ID_abc", "");
    data.set("photo", new Blob(["x"]), "x.jpg");
    expect(formValues(data)).toEqual({ name: "Sniff" });
  });
});
