import { Grid, GridItem, Text, Box } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import SharedData from "../../../Service/SharedData";

export function MemoryCell({ address, value }: { address: string; value: number }) {
  return (
    <GridItem w="100%" h="10" colSpan={1}>
      <Text color={value === 0 ? "gray.600" : "pink.400"} as="b">
        {value === 0 ? "0" : value.toString(10)} {/* Display in integer format */}
      </Text>
    </GridItem>
  );
}

export function MemoryView() {
  const [memoryUpdated, setMemoryUpdated] = useState(false);
  const shared: SharedData = SharedData.instance;

  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUpdated((prev) => !prev); // Toggle state to trigger re-render
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Define register values safely
  const registersValues = shared.currentProcessor?.regbank || new Array(32).fill(0);

  // Debugging: Log the register values
  console.log("Register Values:", registersValues);

  // MIPS registers: listing all 32 registers
  const registers = [
    "$zero", "$at", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3", 
    "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7", 
    "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7", 
    "$t8", "$t9", "$k0", "$k1", "$gp", "$sp", "$fp", "$ra"
  ];

  const renderRegisters = () => {
    const table = [];

    // Render registers in rows of 8 (2 columns for each row, 4 rows total)
    for (let i = 0; i < registers.length; i++) {
      const regValue = registersValues[i];
      table.push(
        <GridItem key={`reg-${i}`} colSpan={1} h="10">
          <Text color="green.500" as="b" fontSize="sm">
            {`${registers[i]}: ${regValue}`} {/* Display in integer format */}
          </Text>
        </GridItem>
      );

      // Break into rows of 8 registers per row
      if ((i + 1) % 8 === 0) {
        table.push(
          <GridItem key={`reg-row-${i}`} colSpan={8} h="10" style={{ borderBottom: "1px solid #ddd" }}></GridItem>
        );
      }
    }

    return table;
  };

  return (
    <Box p={5}>
      <Text fontSize="xl" fontWeight="bold" marginBottom={5}>
        Registers
      </Text>

      <Grid templateColumns="repeat(4, 1fr)" gap={5}>
        {/* Render the registers */}
        {renderRegisters()}
      </Grid>
    </Box>
  );
}

export default React.memo(MemoryView);
