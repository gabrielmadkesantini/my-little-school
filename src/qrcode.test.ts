import { test, expect } from "vitest";

import qrcode from "qrcode";

async function generateQRCode(name: string) {
  const qrCode = await qrcode.toDataURL(name);
  return qrCode;
}

test("", async () => {
  let name = "Ana paula guimarães"
  const qrCode = await generateQRCode(name);

  console.log(qrCode);
  expect(qrCode).toBeTruthy();
});
