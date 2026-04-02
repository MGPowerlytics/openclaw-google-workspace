/**
 * Google Sheets API client wrapper.
 */

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export interface SheetData {
  range: string;
  values: string[][];
}

export interface SheetsClient {
  readRange(spreadsheetId: string, range: string): Promise<SheetData>;
  writeRange(
    spreadsheetId: string,
    range: string,
    values: string[][],
  ): Promise<{ updatedCells: number; updatedRange: string }>;
}

export function createSheetsClient(auth: OAuth2Client): SheetsClient {
  const sheets = google.sheets({ version: "v4", auth });

  return {
    async readRange(spreadsheetId, range) {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return {
        range: res.data.range ?? range,
        values: (res.data.values ?? []) as string[][],
      };
    },

    async writeRange(spreadsheetId, range, values) {
      const res = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });

      return {
        updatedCells: res.data.updatedCells ?? 0,
        updatedRange: res.data.updatedRange ?? range,
      };
    },
  };
}
