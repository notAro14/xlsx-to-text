import { basename } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  exists,
  mkdir,
  readFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import * as xlsx from "xlsx";

const RESULTS_DIRECTORY = "resultats";

export type SelectedFile = {
  path: string;
  status: "pending" | "success" | "error" | "idle";
};

export function resolveColorFromStatus(status: SelectedFile["status"]) {
  switch (status) {
    case "success":
      return "green";
    case "error":
      return "red";

    default:
      return undefined;
  }
}

export async function maybeCreateResultsDirectory() {
  if (!(await exists(RESULTS_DIRECTORY, { baseDir: BaseDirectory.Desktop })))
    await mkdir(RESULTS_DIRECTORY, { baseDir: BaseDirectory.Desktop });
}

export async function convertExcelToText(filePath: string) {
  const filename = await basename(filePath);
  const directory = `${RESULTS_DIRECTORY}/${filename.split(".")[0]}`;

  const contents = await readFile(filePath, {
    baseDir: BaseDirectory.Home,
  });
  const workbook = xlsx.read(contents, { type: "array" });
  if (!(await exists(directory, { baseDir: BaseDirectory.Desktop })))
    await mkdir(directory, { baseDir: BaseDirectory.Desktop });

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });
    const formattedData = jsonData.map((row) => {
      // @ts-ignore
      return row.map((cell) => {
        if (typeof cell === "string" && /^\d+:\d+$/.test(cell)) return cell;
        return cell;
      });
    });
    const tabDelimitedText = formattedData
      .map((row) => row.join("\t"))
      .join("\n");

    await writeTextFile(`${directory}/${sheetName}.txt`, tabDelimitedText, {
      baseDir: BaseDirectory.Desktop,
    });
  }
}
