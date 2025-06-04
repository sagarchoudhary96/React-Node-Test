import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useState } from "react";
import ContactTable from "./Contact.js";
import Spinner from "components/spinner/Spinner";
import { GiClick } from "react-icons/gi";

const MultiContactModel = (props) => {
  const { onClose, isOpen, fieldName, setFieldValue, data } = props;
  const [selectedValues, setSelectedValues] = useState([]);
  const [isLoding, setIsLoding] = useState(false);

  const columns = [
    { Header: "#", accessor: "_id", isSortable: false, width: 10 },
    { Header: "Full Name", accessor: "fullName" },
    { Header: "Phone Number", accessor: "phoneNumber" },
    { Header: "Email Address", accessor: "email" },
  ];
  const uniqueValues = [...new Set(selectedValues)];

  const handleSubmit = async () => {
    try {
      setIsLoding(true);
      setFieldValue(fieldName, uniqueValues);
      onClose();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoding(false);
    }
  };

  return (
    <Modal onClose={onClose} size="full" isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Contact</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoding ? (
            <Flex justifyContent={"center"} alignItems={"center"} width="100%">
              <Spinner />
            </Flex>
          ) : (
            <ContactTable
              tableData={data}
              type="multi"
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
              columnsData={columns}
              title="Contact"
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="brand"
            onClick={handleSubmit}
            disabled={isLoding ? true : false}
            leftIcon={<GiClick />}
          >
            {" "}
            {isLoding ? <Spinner /> : "Select"}
          </Button>
          <Button onClick={() => onClose()}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultiContactModel;
