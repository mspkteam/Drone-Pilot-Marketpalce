import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isBlobStorageConfigured } from "@/lib/storage/public-asset";

describe("public asset storage helpers", () => {
  it("reports blob configured from BLOB_READ_WRITE_TOKEN", () => {
    const prev = process.env.BLOB_READ_WRITE_TOKEN;
    try {
      delete process.env.BLOB_READ_WRITE_TOKEN;
      assert.equal(isBlobStorageConfigured(), false);

      process.env.BLOB_READ_WRITE_TOKEN = "[SENSITIVE]";
      assert.equal(isBlobStorageConfigured(), false);

      process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test";
      assert.equal(isBlobStorageConfigured(), true);
    } finally {
      if (prev === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = prev;
    }
  });
});
