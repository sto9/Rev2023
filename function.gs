const ENEMY_N = 18;

const BASE_ID_ROW = 3;
const DATE_COL = 20;
const ID_COL = 21;
const BASE_ROWS = [3, 24];
const BASE_MUSIC_COL = 1;

let MUSICS_AND_DIFF = [[], []];

async function PrepareMusicInfo(sheet) {
  for (let team = 0; team < 2; team++) {
    for (let j = 0; j < ENEMY_N; j++) {
      const position = String.fromCharCode(65 + BASE_MUSIC_COL + j)
        + String(BASE_ROWS[team] - 1);
      const sheetRange = sheet.getRange(position);

      let title = String(sheetRange.getValue());
      let diff = (sheetRange.getBackground() === "#434343" ? "ULT" : "MAS");
      MUSICS_AND_DIFF[team].push([title, diff]);
    }
  }
}

async function UpdateIndividual(name, nameIndex, sheet) {
  const API_URL = "https://api.chunirec.net/2.0/records/showall.json?region=jp2&token=0cc61074c6f6ccf038b3c62be917be3ef317458be49bd3cd68c78a80b4d024b144db12e7f941a8c043f3ac8b4b0c610740e8960baf53f5469de414d6588fa6b5&user_name="
    + name;
  let response;
  try {
    response = UrlFetchApp.fetch(API_URL);
  } catch {
    console.log("Not Found: " + name);
    return;
  }
  const fetchedContent = await response.getContentText();
  const jsonData = JSON.parse(fetchedContent);
  const records = await jsonData["records"];

  for (let team = 0; team < 2; team++) {
    for (let j = 0; j < MUSICS_AND_DIFF[team].length; j++) {
      const title = MUSICS_AND_DIFF[team][j][0];
      const diff = MUSICS_AND_DIFF[team][j][1];

      let recordsIndex = -1;
      for (let ri = 0; ri < records.length; ri++) {
        if (records[ri]["title"] === title && records[ri]["diff"] === diff) {
          recordsIndex = ri;
          break;
        }
      }
      if (recordsIndex === -1) {
        console.log("Not Found: " + title);
        continue;
      }

      const chunirecScore = Number(records[recordsIndex]["score"]);

      const position = String.fromCharCode(65 + BASE_MUSIC_COL + j)
        + String(BASE_ROWS[team] + nameIndex);
      const sheetRange = sheet.getRange(position);
      const sheetScore = Number(sheetRange.getValue());
      if (chunirecScore > sheetScore) {
        sheetRange.setValue(chunirecScore);
      }
    }
  }
}

async function UpdateDate(name, nameIndex, sheet) {
  const API_URL = "https://api.chunirec.net/2.0/records/profile.json?region=jp2&token=0cc61074c6f6ccf038b3c62be917be3ef317458be49bd3cd68c78a80b4d024b144db12e7f941a8c043f3ac8b4b0c610740e8960baf53f5469de414d6588fa6b5&user_name="
    + name;
  let response;
  try {
    response = UrlFetchApp.fetch(API_URL);
  } catch {
    console.log("Not Found: " + name);
    return;
  }
  const fetchedContent = await response.getContentText();
  const jsonData = JSON.parse(fetchedContent);
  const date = new Date(jsonData["updated_at"]);
  const startDate = new Date("2023-10-07T18:02:00+0900");
  if (date < startDate) return;

  let dateCurrent = new Date();
  let diffTime = dateCurrent.getTime() - date.getTime();
  let diffDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  for (let j = 0; j < 2; j++) {
    const position = String.fromCharCode(65 + DATE_COL)
      + String(BASE_ROWS[j] + nameIndex);
    const range = sheet.getRange(position);
    if (diffDay === 0) {
      range.setFontColor("red");
      let diffHour = Math.floor(diffTime / (1000 * 60 * 60));
      range.setValue(String(diffHour) + "時間前");
    } else {
      range.setFontColor("black");
      range.setValue(String(diffDay) + "日前");
    }
  }
}

async function UpdateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("白組スコア(10/16~)");
  await PrepareMusicInfo(sheet);
  
  for (let i = 0; i < ENEMY_N; i++) {
    const position = String.fromCharCode(65 + ID_COL)
      + String(BASE_ID_ROW + i);
    const name = sheet.getRange(position).getValue();
    if (name === "") continue;
    UpdateIndividual(name, i, sheet);
    UpdateDate(name, i, sheet);
  }
}