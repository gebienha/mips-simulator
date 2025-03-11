import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";

export default function BreakpointModal(props: {
  isOpen: boolean;
  onClose: () => void;
  addBreakpoint: (address: number) => void;
  removeBreakpoint: (address: number) => void;
  breakpoints: number[];
}) {
  const [address, setAddress] = useState<string>("");
  const toast = useToast();

  const handleAddBreakpoint = () => {
    const addressNumber = parseInt(address, 16);
    if (!isNaN(addressNumber)) {
      if (!props.breakpoints.includes(addressNumber)) {
        props.addBreakpoint(addressNumber);
        toast({
          title: "Breakpoint added",
          description: `Breakpoint added at address ${address}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Breakpoint already exists",
          description: `Breakpoint already exists at address ${address}`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Invalid address",
        description: "Please enter a valid hexadecimal address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setAddress("");
  };

  const handleRemoveBreakpoint = () => {
    const addressNumber = parseInt(address, 16);
    if (!isNaN(addressNumber)) {
      if (props.breakpoints.includes(addressNumber)) {
        props.removeBreakpoint(addressNumber);
        toast({
          title: "Breakpoint removed",
          description: `Breakpoint removed from address ${address}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Breakpoint not found",
          description: `No breakpoint found at address ${address}`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Invalid address",
        description: "Please enter a valid hexadecimal address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setAddress("");
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add/Remove Breakpoint</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Enter address in HEX"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleAddBreakpoint}>
            Add
          </Button>
          <Button colorScheme="red" onClick={handleRemoveBreakpoint}>
            Remove
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}