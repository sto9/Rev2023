const BASE_ID_ROW = 3;
const ID_COL = 20;
const BASE_ROWS = [3, 24];
const BASE_MUSIC_COL = 3;

const MUSICS_AND_DIFF =
  [[
    ["異星にいこうね", "MAS"],
    ["ウソラセラ", "MAS"],
    ["泥の分際で私だけの大切を奪おうだなんて", "MAS"],
    ["elegante", "ULT"],
    ["お空のニュークリアフュージョン道場", "MAS"],
    ["こちら、幸福安心委員会です。", "MAS"],
    ["ツクヨミステップ", "MAS"],
    ["Pure Ruby", "MAS"],
    ["幾望の月", "ULT"],
    ["ハイセンスナンセンス", "MAS"],
    ["ぜったい！昇天★鎮魂歌♂", "MAS"],
    ["eden", "MAS"],
    ["Elemental Ethnic", "MAS"],
    ["Genesis", "MAS"],
    ["神威", "MAS"],
    ["ホーリーサンバランド", "MAS"],
  ],
  [
    ["すきなことだけでいいです", "MAS"],
    ["ミックスナッツ", "MAS"],
    ["Teriqma", "MAS"],
    ["タイガーランペイジ", "MAS"],
    ["B.B.K.K.B.K.K.", "ULT"],
    ["DAZZLING♡SEASON", "MAS"],
    ["Ignition", "MAS"],
    ["インビジブル", "MAS"],
    ["セイクリッド　ルイン", "MAS"],
    ["Oshama Scramble!", "MAS"],
    ["Outlaw's Lullaby", "MAS"],
    ["Evans", "ULT"],
    ["FREEDOM DiVE", "MAS"],
    ["Garakuta Doll Play", "MAS"],
    ["L9", "ULT"],
    ["花と、雪と、ドラムンベース。", "MAS"],
  ]];

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
  const jsonData = JSON.parse(fetchedContent)
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
      if (recordsIndex === -1){
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

function UpdateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("白組スコア(10/16~)");
  const ENEMY_N = 18;
  for (let i = 0; i < ENEMY_N; i++) {
    const position = String.fromCharCode(65 + ID_COL)
      + String(BASE_ID_ROW + i);
    const name = sheet.getRange(position).getValue();
    if (name === "") continue;
    UpdateIndividual(name, i, sheet);
  }
}