import {
  Button,
  Callout,
  Code,
  Container,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { basename } from "@tauri-apps/api/path";
import { message, open } from "@tauri-apps/plugin-dialog";
import {
  BaseDirectory,
  exists,
  mkdir,
  readFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { Download, File, FileSpreadsheet, Info } from "lucide-react";
import { useState } from "react";
import * as xlsx from "xlsx";

async function readExcel(filePath: string) {
  const filename = await basename(filePath);
  const directory = `resultats/${filename.split(".")[0]}`;

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

export function App() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [converting, setConverting] = useState<boolean>(false);
  return (
    <Container size={"1"} pt={"8"}>
      <Flex asChild direction={"column"} gap={"4"}>
        <main>
          <Flex asChild direction={"column"}>
            <hgroup>
              <Heading as="h1">
                Convertir un excel <Code>.xlsx</Code> en texte <Code>.txt</Code>
              </Heading>
              <Text color="gray" size={"1"}>
                délimité avec tabulation
              </Text>
            </hgroup>
          </Flex>

          <Button
            type="button"
            disabled={converting}
            onClick={openFileSelector}
            variant={selectedFile ? "outline" : "solid"}
          >
            <File size={"1em"} />
            {selectedFile ? "Changer le fichier" : "Sélectionner un fichier"}
          </Button>

          {selectedFile ? (
            <Flex align={"center"} gap={"2"}>
              <Tooltip content={selectedFile}>
                <IconButton variant="ghost" radius="full">
                  <FileSpreadsheet size={"1em"} />
                </IconButton>
              </Tooltip>
              <Text title={selectedFile} className="truncate">
                {selectedFile}
              </Text>
            </Flex>
          ) : (
            <Callout.Root>
              <Callout.Icon>
                <Info size={"1em"} />
              </Callout.Icon>
              <Callout.Text>
                Vous n&apos;avez pas sélectionné de fichier à convertir
              </Callout.Text>
            </Callout.Root>
          )}
          {selectedFile && (
            <Button disabled={converting} mt={"8"} onClick={convert}>
              <Spinner loading={converting}>
                <Download size={"1em"} />
              </Spinner>
              Convertir
            </Button>
          )}
        </main>
      </Flex>
    </Container>
  );

  async function convert() {
    setConverting(true);
    try {
      await readExcel(selectedFile);
      setSelectedFile("");
      await message("Conversion terminée", { title: "Succès", kind: "info" });
    } catch (error) {
      console.error(error);
    } finally {
      setConverting(false);
    }
  }

  async function openFileSelector() {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ extensions: ["xlsx"], name: "Excel" }],
    });
    if (selected) {
      setSelectedFile(selected);
    }
  }
}
