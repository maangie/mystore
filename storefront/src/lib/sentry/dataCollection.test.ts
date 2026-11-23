import { describe, expect, it } from "vitest";
import { sentryDataCollection } from "./dataCollection";

describe("sentryDataCollection", () => {
  it("個人情報を送らないときは、個人情報にあたる項目を止める", () => {
    expect(sentryDataCollection(false)).toEqual({
      userInfo: false,
      cookies: false,
      httpBodies: [],
      stackFrameVariables: false,
    });
  });

  it("個人情報を送るときは、Sentry の初期値に任せる", () => {
    expect(sentryDataCollection(true)).toEqual({});
  });
});
