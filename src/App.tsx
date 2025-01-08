import {
  Button,
  Callout,
  Code,
  Container,
  Flex,
  Heading,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import { Download, File, FileSpreadsheet, Info } from "lucide-react";
import { useState } from "react";
import * as xlsx from "xlsx";

async function readExcel(filePath: string) {
  const contents = await readFile(filePath, {
    baseDir: BaseDirectory.Home,
  });
  const workbook = xlsx.read(contents, { type: "array" });
  console.log(workbook.SheetNames);
}

export function App() {
  const [selectedFile, setSelectedFile] = useState<string>("");
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
          {selectedFile && (
            <Button onClick={() => readExcel(selectedFile)}>
              <Download size={"1em"} />
              Convertir
            </Button>
          )}

          <Button
            type="button"
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
        </main>
      </Flex>
    </Container>
  );

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
