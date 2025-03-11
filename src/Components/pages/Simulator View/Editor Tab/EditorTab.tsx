import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Icon,
  IconButton,
  Input,
  Slide,
  Stack,
  Tooltip,
  useToast,
  Flex,
  Badge,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { BsTerminalFill, BsPauseFill } from "react-icons/bs";
import { HiPlay } from "react-icons/hi";
import { CgScreen } from "react-icons/cg";
import { RiRewindFill, RiSettings2Fill } from "react-icons/ri";
import { FaDownload, FaFolderOpen } from "react-icons/fa";
import { IoMdSave } from "react-icons/io";
import { BsFileEarmarkCode } from "react-icons/bs";
import SharedData from "../../../../Service/SharedData";
import WorkerService from "../../../../Service/WorkerService";
import Logger from "../../../../Service/Logger";
import SimulatorService from "../../../../Service/SimulatorService";
import AssemblyEditor from "../../../AssemblyEditor";
import ConfigModal from "./ConfigModal";
import ConsoleTerminal from "./ConsoleTerminal";
import DebugTerminal from "./DebugTerminal";
import LoadProgramModal from "./LoadProgramModal";
import Screen, { ScreenRenderer } from "./Screen";
import MemoryTerminal from "./MemoryTerminal";

export default function EditorView(props: {
  runBtn: Function;
  assembleBtn: Function;
  onEditorChange: (value: string | undefined, event: any) => void;
  callExecuteStep: Function;
}) {
  // Icons
  const HiPlayIcon = () => (
    <Icon as={HiPlay} style={{ transform: "scale(1.4)" }} />
  );
  const TerminalFill = () => <Icon as={BsTerminalFill} />;

  // Handles the visibility of the console and debug terminal
  const [consoleOpen, setConsoleOpen] = useState<boolean>(false);

  // Handles the state of the console and debug terminal
  const [consoleTxt, setConsoleTxt] = useState<string>("");

  // Handles which terminal is currently selected
  const [currentTerminal, setCurrentTerminal] = useState<number>(0);

  // Handles the information text of the debug terminal
  const [debugTxt, setDebugTxt] = useState<string>("");

  // Handles the visibility of the configuration modal
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);

  // Handles the visibility of the load program modal
  const [loadProgramModalOpen, setLoadProgramModalOpen] = useState<boolean>(false);

  // Handles the visibility of the screen modal
  const [screenModalOpen, setScreenModalOpen] = useState<boolean>(false);

  // SharedData instance that holds the shared state of the application
  let share: SharedData = SharedData.instance;

  // Logger instance
  let log: Logger = Logger.instance;

  // SimulatorService instance that handles the assembly of the code
  let simservice: SimulatorService = SimulatorService.getInstance();

  const toast = useToast();

  const txtProgramtitle = React.useRef<HTMLInputElement>(null);

  const [registers, setRegisters] = useState({
    T0: share.currentProcessor?.regbank[5],
    T1: share.currentProcessor?.regbank[6],
    T2: share.currentProcessor?.regbank[7],
    T3: share.currentProcessor?.regbank[8],
    T4: share.currentProcessor?.regbank[13],
    T5: share.currentProcessor?.regbank[14],
    T6: share.currentProcessor?.regbank[15],
    A0: share.currentProcessor?.regbank[3],
    A1: share.currentProcessor?.regbank[4],
    A2: share.currentProcessor?.regbank[12],
    A3: share.currentProcessor?.regbank[17],
    S0: share.currentProcessor?.regbank[18],
    S1: share.currentProcessor?.regbank[19],
    S2: share.currentProcessor?.regbank[20],
    S3: share.currentProcessor?.regbank[21],
    S4: share.currentProcessor?.regbank[22],
    S5: share.currentProcessor?.regbank[23],
    S6: share.currentProcessor?.regbank[24],
    RA: share.currentProcessor?.regbank[9],
    SP: share.currentProcessor?.regbank[16],
    V0: share.currentProcessor?.regbank[1],
    V1: share.currentProcessor?.regbank[2],
  });

  const [breakpoints, setBreakpoints] = useState<number[]>([]);

  useEffect(() => {
    // Listen for updates to the processor state
    const interval = setInterval(() => {
      setRegisters({
        T0: share.currentProcessor?.regbank[5],
        T1: share.currentProcessor?.regbank[6],
        T2: share.currentProcessor?.regbank[7],
        T3: share.currentProcessor?.regbank[8],
        T4: share.currentProcessor?.regbank[13],
        T5: share.currentProcessor?.regbank[14],
        T6: share.currentProcessor?.regbank[15],
        A0: share.currentProcessor?.regbank[3],
        A1: share.currentProcessor?.regbank[4],
        A2: share.currentProcessor?.regbank[12],
        A3: share.currentProcessor?.regbank[17],
        S0: share.currentProcessor?.regbank[18],
        S1: share.currentProcessor?.regbank[19],
        S2: share.currentProcessor?.regbank[20],
        S3: share.currentProcessor?.regbank[21],
        S4: share.currentProcessor?.regbank[22],
        S5: share.currentProcessor?.regbank[23],
        S6: share.currentProcessor?.regbank[24],
        RA: share.currentProcessor?.regbank[9],
        SP: share.currentProcessor?.regbank[16],
        V0: share.currentProcessor?.regbank[1],
        V1: share.currentProcessor?.regbank[2],
      });
    }, 1000); // Refresh the register values every 1000ms (1 second)

    return () => clearInterval(interval); // Clean up the interval when component unmounts
  }, []);

  // Add pause state
  const [isPaused, setIsPaused] = useState(false);

  // Add pause icon component
  const PauseIcon = () => (
    <Icon as={BsPauseFill} style={{ transform: "scale(1.4)" }} />
  );

  // Add pause handler
  const handlePause = () => {
    setIsPaused(!isPaused);
    if (share.currentProcessor) {
      share.currentProcessor.isPaused = !isPaused;
      if (!isPaused) {
        // If we're pausing
        WorkerService.instance.pauseExecution();
      }
    }
  };

  // Handle "Run" button click
  const handleRun = () => {
    const interval = setInterval(() => {
      if (share.currentProcessor?.isPaused || share.currentProcessor?.halted || (share.currentProcessor?.currentLine !== undefined && breakpoints.includes(share.currentProcessor.currentLine))) {
        clearInterval(interval);
      } else {
        props.callExecuteStep();
      }
    }, share.processorFrequency); // Adjust the delay as needed
  };

  const handleSetBreakpoint = (lineNumber: number) => {
    setBreakpoints([...breakpoints, lineNumber]);
  };

  const handleRemoveBreakpoint = (lineNumber: number) => {
    setBreakpoints(breakpoints.filter(b => b !== lineNumber));
  };

  function setScreenRendererCanva() {
    try {
      let canva = (document.getElementById("screenCanvas") as HTMLCanvasElement).getContext("2d");
      ScreenRenderer.instance.draw = canva;
    } catch (e) {
      console.log("error defining canva", e);
    }
  }

  // Updates the console and debug terminal when the log changes
  useEffect(() => {
    Logger.instance.onLogChange(() => {
      setConsoleTxt(log.getConsole() + log.getErrors());
      setDebugTxt(log.getDebug());

      /* Responsible for scrolling the text areas */
      let debugTxtArea = document.getElementById("debugTxtArea");
      if (debugTxtArea) debugTxtArea.scrollTop = debugTxtArea.scrollHeight;

      let consoleTxtArea = document.getElementById("consoleTxtArea");
      if (consoleTxtArea)
        consoleTxtArea.scrollTop = consoleTxtArea.scrollHeight;
    });
  }, [consoleOpen, debugTxt]);

  useEffect(() => {
    setScreenRendererCanva();
  }, [screenModalOpen]);

  return (
    <Stack direction={"column"} style={{ flex: 1, overflowY: "auto" }}>
      {screenModalOpen ? <Screen /> : <></>}
      <Slide
        direction="right"
        in={consoleOpen}
        style={{
          zIndex: 10,
          pointerEvents: "none",
          position: "absolute",
          top: 0, // Set the top to 0 to align it horizontally
          right: 0, // Position it to the right of the editor
          height: "100vh", // Ensure it spans the full height
          width: "320px", // Adjust the width as needed for the terminal
        }}
      >
        <Box
          p="40px"
          color="white"
          mt="4"
          bg="#20212b"
          rounded="md"
          shadow="md"
          style={{
            position: "relative",
            left: "auto",
            width: "320px",
            height: "40vh",
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <Stack direction="row" spacing={4} zIndex={10} justify="flex-end">
            <Button
              style={{
                position: "relative",
                borderBottom: currentTerminal == 0 ? "solid" : "none",
                backgroundColor: "none",
                background: "none",
                borderRadius: "0px",
                top: -40,
                right: 20,
                zIndex: 10,
              }}
              onClick={() => setCurrentTerminal(0)}
            >
              Terminal
            </Button>
            <Button
              style={{
                position: "relative",
                borderBottom: currentTerminal == 1 ? "solid" : "none",
                backgroundColor: "none",
                background: "none",
                borderRadius: "0px",
                top: -40,
                right: 20,
                zIndex: 10,
              }}
              onClick={() => setCurrentTerminal(1)}
            >
              Debug
            </Button>

            <Button
              style={{
                position: "relative",
                borderBottom: currentTerminal == 2 ? "solid" : "none",
                backgroundColor: "none",
                background: "none",
                borderRadius: "0px",
                top: -40,
                right: 20,
                zIndex: 10,
              }}
              onClick={() => setCurrentTerminal(2)}
            >
              Memory
            </Button>
          </Stack>

          {/* Console  */}
          {currentTerminal == 0 ? (
            <ConsoleTerminal
              value={consoleTxt}
              onClear={() => {
                setConsoleTxt("");
                Logger.instance.clearConsole();
              }}
            />
          ) : (
            <></>
          )}

          {/* Debug terminal  */}
          {currentTerminal == 1 ? (
            <DebugTerminal
              value={debugTxt}
              onClear={() => {
                setDebugTxt("");
                Logger.instance.clearDebug();
              }}
            />
          ) : (
            <></>
          )}

          {/* Registers terminal  */}
          {currentTerminal == 2 ? (
            <MemoryTerminal />
          ) : (
            <></>
          )}
        </Box>
      </Slide>
      <Box style={{ display: "flex", justifyContent: "flex-end", width: "800px" }}>
        <Stack direction="row" align="centre" spacing={4} width="100%">
          <Input
            placeholder="Recent"
            ref={txtProgramtitle}
            variant={"unstyled"}
            defaultValue={share.programTitle}
            onChange={(e) => {
              share.programTitle = e.target.value;
            }}
            size="sm"
            width="200px"
          />
          <Tooltip label="Assemble">
            <IconButton
              icon={<BsFileEarmarkCode style={{ transform: "scale(1.4)" }} />}
              colorScheme="linkedin"
              variant="solid"
              onClick={() => {
                props.assembleBtn();
              }}
              aria-label="Assemble program"
              borderRadius={50}
              size="sm"
              zIndex={10}
            >
              Run
            </IconButton>
          </Tooltip>
          <Tooltip label="Run">
            <IconButton
              icon={<HiPlayIcon />}
              colorScheme="teal"
              variant="solid"
              onClick={handleRun}
              aria-label="Run program"
              borderRadius={50}
              size="sm"
              zIndex={10}
            >
              Run
            </IconButton>
          </Tooltip>
          <Tooltip label="Pause">
            <IconButton
              icon={<PauseIcon />}
              colorScheme="orange"
              variant="solid"
              onClick={handlePause}
              aria-label="Pause program"
              borderRadius={50}
              size="sm"
              zIndex={10}
              isDisabled={!share.currentProcessor}
            >
              {isPaused ? "Resume" : "Pause"}
            </IconButton>
          </Tooltip>
          <Tooltip label="Run next instruction">
            <IconButton
              icon={<ArrowForwardIcon style={{ transform: "scale(1.4)" }} />}
              colorScheme="yellow"
              aria-label="Run step"
              variant="solid"
              borderRadius={50}
              size="sm"
              onClick={() => props.callExecuteStep()}
              zIndex={10}
            >
              Step
            </IconButton>
          </Tooltip>
          <Tooltip label="Set Breakpoint">
            <IconButton
              icon={<Icon as={RiSettings2Fill} style={{ transform: "scale(1.2)" }} />}
              zIndex={10}
              aria-label="Set Breakpoint"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => handleSetBreakpoint(share.currentProcessor?.currentLine)}
            >
              Breakpoint
            </IconButton>
          </Tooltip>
          <Tooltip label="Open terminal">
            <IconButton
              icon={<TerminalFill />}
              color="white"
              backgroundColor={SharedData.theme.editorBackground}
              variant="solid"
              aria-label="Open console"
              borderRadius={50}
              size="sm"
              zIndex={10}
              onClick={() => {
                setConsoleOpen(!consoleOpen);
              }}
            >
              Terminal
            </IconButton>
          </Tooltip>
          <Tooltip label="Reset">
            <IconButton
              icon={<Icon as={RiRewindFill} />}
              aria-label="Reset"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              zIndex={10}
              onClick={() => {
                WorkerService.instance.resetCpu();
                share.currentProcessor?.reset();
                if (share.currentProcessor) {
                  share.currentProcessor.halted = true;
                  share.currentProcessor.frequency = 1000;
                  share.processorFrequency = 1000;
                }
                clearInterval(share.interval ?? 0);
              }}
            >
              Reset
            </IconButton>
          </Tooltip>
          <Tooltip label="Screen">
            <IconButton
              icon={<CgScreen />}
              aria-label={"Screen"}
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              zIndex={10}
              onClick={() => {
                setScreenModalOpen(!screenModalOpen);
              }}
            />
          </Tooltip>
          <Tooltip label="Configuration">
            <IconButton
              icon={<Icon as={RiSettings2Fill} style={{ transform: "scale(1.2)" }} />}
              zIndex={10}
              aria-label="Configuration"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => setConfigModalOpen(true)}
            >
              Configuration
            </IconButton>
          </Tooltip>
          <Tooltip label="Save">
            <IconButton
              icon={<Icon as={IoMdSave} style={{ transform: "scale(1.2)" }} />}
              zIndex={10}
              aria-label="Save"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => {
                share.saveProgram(share.programTitle.toLowerCase(), share.code);
                toast({
                  title: "Code saved",
                  description: "Your code has been saved",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Save
            </IconButton>
          </Tooltip>
          <Tooltip label="Load">
            <IconButton
              icon={<Icon as={FaFolderOpen} style={{ transform: "scale(1.2)" }} />}
              zIndex={10}
              aria-label="Load"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => setLoadProgramModalOpen(true)}
            >
              Load
            </IconButton>
          </Tooltip>
          <Tooltip label="Download Code">
            <IconButton
              icon={<Icon as={FaDownload} style={{ transform: "scale(1.2)" }} />}
              zIndex={10}
              aria-label="Download Code"
              backgroundColor={SharedData.theme.editorBackground}
              color="white"
              borderRadius={50}
              size="sm"
              onClick={() => {
                function downloadFile() {
                  const element = document.createElement("a");
                  const file = new Blob([share.code], { type: "text/plain" });
                  element.href = URL.createObjectURL(file);
                  element.download = share.programTitle + ".txt";
                  document.body.appendChild(element); // Required for this to work in FireFox
                  element.click();
                }

                try {
                  downloadFile();
                  toast({
                    title: "Code downloaded",
                    description: "Your code has been downloaded",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                } catch {
                  toast({
                    title: "Something went wrong...",
                    description: "There was an error while trying to download the code",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            >
              Download
            </IconButton>
          </Tooltip>
        </Stack>
        {configModalOpen ? (
          <ConfigModal isOpen={configModalOpen} close={() => setConfigModalOpen(false)} />
        ) : (
          <></>
        )}
        <LoadProgramModal isOpen={loadProgramModalOpen} close={() => setLoadProgramModalOpen(false)} />
      </Box>
      <AssemblyEditor
        onEditorChange={props.onEditorChange}
        style={{
          width: "800px",
          height: "250px",
          overflow: "auto",
        }}
      />
      <Flex direction="column" fontFamily="monospace" style={{ marginBottom: 10 }}>
        {/* T Group */}
        <Flex direction="row" wrap="wrap" justify="flex-start">
          <Badge colorScheme="green">
            T0 <br />
            {share.currentProcessor?.regbank[5].toString(16)} <br />
            ({share.currentProcessor?.regbank[5].toString(10)})
          </Badge>
          <Badge colorScheme="green">
            T1 <br />
            {share.currentProcessor?.regbank[6].toString(16)} <br />
            ({share.currentProcessor?.regbank[6].toString(10)})
          </Badge>
          <Badge colorScheme="green">
            T2 <br />
            {share.currentProcessor?.regbank[7].toString(16)} <br />
            ({share.currentProcessor?.regbank[7].toString(10)})
          </Badge>
          <Badge colorScheme="green">
            T3 <br />
            {share.currentProcessor?.regbank[8].toString(16)} <br />
            ({share.currentProcessor?.regbank[8].toString(10)})
          </Badge>
          <Badge colorScheme="green">
            T4 <br />
            {share.currentProcessor?.regbank[13].toString(16)} <br />
            ({share.currentProcessor?.regbank[13].toString(10)})
          </Badge>
          <Badge colorScheme="green">
            T5 <br />
            {share.currentProcessor?.regbank[14].toString(16)} <br />
            ({share.currentProcessor?.regbank[14].toString(10)})
          </Badge>
          <Badge colorScheme="green">
            T6 <br />
            {share.currentProcessor?.regbank[15].toString(16)} <br />
            ({share.currentProcessor?.regbank[15].toString(10)})
          </Badge>
        </Flex>

        {/* S Group */}
        <Flex direction="row" wrap="wrap" justify="flex-start">
          <Badge colorScheme="cyan">
            S0 <br />
            {share.currentProcessor?.regbank[18].toString(16)} <br />
            ({share.currentProcessor?.regbank[18].toString(10)})
          </Badge>
          <Badge colorScheme="cyan">
            S1 <br />
            {share.currentProcessor?.regbank[19].toString(16)} <br />
            ({share.currentProcessor?.regbank[19].toString(10)})
          </Badge>
          <Badge colorScheme="cyan">
            S2 <br />
            {share.currentProcessor?.regbank[20].toString(16)} <br />
            ({share.currentProcessor?.regbank[20].toString(10)})
          </Badge>
          <Badge colorScheme="cyan">
            S3 <br />
            {share.currentProcessor?.regbank[21].toString(16)} <br />
            ({share.currentProcessor?.regbank[21].toString(10)})
          </Badge>
          <Badge colorScheme="cyan">
            S4 <br />
            {share.currentProcessor?.regbank[22].toString(16)} <br />
            ({share.currentProcessor?.regbank[22].toString(10)})
          </Badge>
          <Badge colorScheme="cyan">
            S5 <br />
            {share.currentProcessor?.regbank[23].toString(16)} <br />
            ({share.currentProcessor?.regbank[23].toString(10)})
          </Badge>
          <Badge colorScheme="cyan">
            S6 <br />
            {share.currentProcessor?.regbank[24].toString(16)} <br />
            ({share.currentProcessor?.regbank[24].toString(10)})
          </Badge>
        </Flex>

        {/* A Group */}
        <Flex direction="row" wrap="wrap" justify="flex-start">
          <Badge colorScheme="red">
            A0 <br />
            {share.currentProcessor?.regbank[3].toString(16)} <br />
            ({share.currentProcessor?.regbank[3].toString(10)})
          </Badge>
          <Badge colorScheme="red">
            A1 <br />
            {share.currentProcessor?.regbank[4].toString(16)} <br />
            ({share.currentProcessor?.regbank[4].toString(10)})
          </Badge>
          <Badge colorScheme="red">
            A2 <br />
            {share.currentProcessor?.regbank[12].toString(16)} <br />
            ({share.currentProcessor?.regbank[12].toString(10)})
          </Badge>
          <Badge colorScheme="red">
            A3 <br />
            {share.currentProcessor?.regbank[17].toString(16)} <br />
            ({share.currentProcessor?.regbank[17].toString(10)})
          </Badge>
        </Flex>

        {/* RA, SP, V0, V1 */}
        <Flex direction="row" wrap="wrap" justify="flex-start">
          <Badge colorScheme="red">
            RA <br />
            {share.currentProcessor?.regbank[9].toString(16)} <br />
            ({share.currentProcessor?.regbank[9].toString(10)})
          </Badge>
          <Badge colorScheme="red">
            SP <br />
            {share.currentProcessor?.regbank[16].toString(16)} <br />
            ({share.currentProcessor?.regbank[16].toString(10)})
          </Badge>
          <Badge colorScheme="purple">
            V0 <br />
            {share.currentProcessor?.regbank[1].toString(16)} <br />
            ({share.currentProcessor?.regbank[1].toString(10)})
          </Badge>
          <Badge colorScheme="purple">
            V1 <br />
            {share.currentProcessor?.regbank[2].toString(16)} <br />
            ({share.currentProcessor?.regbank[2].toString(10)})
          </Badge>
        </Flex>
      </Flex>

    </Stack>
  );
};
