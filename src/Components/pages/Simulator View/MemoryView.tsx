import { Grid, GridItem, Text } from "@chakra-ui/react";
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

  // Define memory data here
  const memoryData = shared.currentProcessor?.memory || new Array(1024).fill({ value: 0 });
  // console.log("Initial Register Values:", shared.currentProcessor?.regbank);
  // console.log(shared.currentProcessor?.regbank[9]);  // Should be 1
  // console.log(shared.currentProcessor?.memory);  // Check if memory affects registers

  // Define register values safely
  const registersValues = shared.currentProcessor?.regbank || new Array(32).fill(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUpdated((prev) => !prev); // Toggle state to trigger re-render
    }, 500); // Adjust timing as needed
  
    return () => clearInterval(interval);
  }, []);
  

  // MIPS registers: listing all 32 registers
  const registers = [
    "$zero", "$at", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3", 
    "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7", 
    "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7", 
    "$t8", "$t9", "$k0", "$k1", "$gp", "$sp", "$fp", "$ra"
  ];

  const renderRegisters = () => {
    const table = [];
    const registersValues = shared.currentProcessor?.regbank || new Array(32).fill(0);

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

  const renderMemoryTable = () => {
    const table = [];
    const memorySize = memoryData.length; // ✅ Use memoryData instead of shared.currentProcessor?.memory
  
    // Render memory in rows of 16 addresses
    for (let row = 0; row < Math.ceil(memorySize / 16); row++) {
      const rowAddress = row * 16;
  
      // Render row label (hex address)
      table.push(
        <GridItem key={`row-${row}`} colSpan={1} h="10">
          <Text color="blue.500" as="b">
            {`0x${rowAddress.toString(16).padStart(8, "0")}`}
          </Text>
        </GridItem>
      );
  
      // ✅ Iterate memoryData properly
      for (let col = 0; col < 16; col++) {
        const address = rowAddress + col;
        const memValue = memoryData[address]?.value || 0; // Avoid undefined errors
  
        table.push(
          <MemoryCell
            key={`cell-${address}`}
            address={`0x${(address * 4).toString(16).padStart(8, "0")}`}
            value={memValue}
          />
        );
      }
    }
  
    return table;
  };
  

  return (
    <>
      {/* Memory and Registers View */}
      <Text fontSize="xl" fontWeight="bold" marginTop={5}>
        Memory and Register View
      </Text>

      <Grid templateColumns="repeat(17, 50px)" gap={0} style={{ marginTop: 15 }}>
        {/* Column Header for Memory */}
        <GridItem colSpan={1} h="10"></GridItem> {/* Empty corner cell */}
        {[...Array(16)].map((_, idx) => (
          <GridItem key={idx} colSpan={1} h="10">
            <Text color="blue.500" as="b">
              {idx.toString(16).toUpperCase()}
            </Text>
          </GridItem>
        ))}
        {/* Render the memory table */}
        {renderMemoryTable()}
      </Grid>

      <Text fontSize="xl" fontWeight="bold" marginTop={5}>
        Registers
      </Text>

      <Grid templateColumns="repeat(4, 1fr)" gap={5} style={{ marginTop: 15 }}>
        {/* Render the registers */}
        {renderRegisters()}
      </Grid>
    </>
  );
}



export default React.memo(MemoryView);
