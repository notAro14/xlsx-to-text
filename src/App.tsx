import {
  Button,
  Code,
  Container,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Spinner,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Check,
  Download,
  FileSpreadsheet,
  Files,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type SelectedFile,
  convertExcelToText,
  maybeCreateResultsDirectory,
  resolveColorFromStatus,
} from "./utils";

export function App() {
  useEffect(() => {
    (async () => {
      await maybeCreateResultsDirectory();
    })();
  }, []);

  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, SelectedFile>
  >({});
  const selectedFilesArray = Object.values(selectedFiles);
  const [converting, setConverting] = useState<boolean>(false);
  return (
    <Container size={"2"} pt={"8"}>
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
            variant="soft"
          >
            <Files size={"1em"} />
            {selectedFilesArray.length
              ? "Sélectionner d'autres fichiers"
              : "Sélectionner des fichiers"}
          </Button>

          {selectedFilesArray.length > 0 && (
            <ScrollArea
              type="scroll"
              scrollbars="vertical"
              style={{ maxHeight: "500px", overscrollBehavior: "contain" }}
            >
              <Flex direction={"column"} gap={"4"}>
                {selectedFilesArray.map(({ path: file, status }) => (
                  <Flex align={"center"} gap={"2"} key={file}>
                    {status === "idle" && (
                      <IconButton
                        variant="outline"
                        color="red"
                        size={"1"}
                        mr={"2"}
                        onClick={() => {
                          setSelectedFiles((prev) => {
                            const { [file]: _, ...rest } = prev;
                            return rest;
                          });
                        }}
                      >
                        <Trash2 size={"0.75em"} />
                      </IconButton>
                    )}
                    <Tooltip content={file}>
                      <IconButton
                        variant="ghost"
                        radius="full"
                        disabled={status === "pending"}
                        color={resolveColorFromStatus(status)}
                      >
                        {status === "idle" && <FileSpreadsheet size={"1em"} />}
                        {status === "success" && <Check size={"1em"} />}
                        {status === "error" && <TriangleAlert size={"1em"} />}
                        {status === "pending" && (
                          <Spinner loading>
                            <FileSpreadsheet size={"1em"} />
                          </Spinner>
                        )}
                      </IconButton>
                    </Tooltip>
                    <Text title={file} className="truncate">
                      {file}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </ScrollArea>
          )}

          {selectedFilesArray.length > 0 && (
            <Button disabled={converting} mt={"4"} onClick={convert}>
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
    for (const { path } of selectedFilesArray) {
      try {
        setSelectedFiles((prev) => ({
          ...prev,
          [path]: { path, status: "pending" },
        }));
        await convertExcelToText(path);
        setSelectedFiles((prev) => ({
          ...prev,
          [path]: { path, status: "success" },
        }));
      } catch (error) {
        setSelectedFiles((prev) => ({
          ...prev,
          [path]: { path, status: "error" },
        }));
        console.error(error);
      }
    }
    setConverting(false);
  }

  async function openFileSelector() {
    const selected = await open({
      multiple: true,
      directory: false,
      filters: [{ extensions: ["xlsx"], name: "Excel" }],
    });
    if (selected && Array.isArray(selected)) {
      setSelectedFiles(
        selected.reduce(
          (acc, path) => {
            acc[path] = { path, status: "idle" };
            return acc;
          },
          {} as Record<string, SelectedFile>,
        ),
      );
    }
  }
}
