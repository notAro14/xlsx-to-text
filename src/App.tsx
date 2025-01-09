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
import { message, open } from "@tauri-apps/plugin-dialog";
import { Download, File, FileSpreadsheet, Info } from "lucide-react";
import { useState } from "react";
import { convertExcelToText } from "./convertExcelToText";

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
      await convertExcelToText(selectedFile);
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
