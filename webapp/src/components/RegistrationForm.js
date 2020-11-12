import React, { Component, useState, useEffect } from 'react'

import {
    Box,
    Form,
    Input,
    Select,
    Field,
    Button,
    Text,
    Checkbox,
    Radio,
    Flex,
    Card,
    Heading
} from "rimble-ui"

export default function RegistrationForm() {
  const [formValidated, setFormValidated] = useState(false);
  const [validated, setValidated] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formInputValue, setFormInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("");

  const handleInput = e => {
    setInputValue(e.target.value);
    validateInput(e);
  };

  const handleFormInput = e => {
    setFormInputValue(e.target.value);
    validateInput(e);
  };

  const handleSelect = e => {
    setSelectValue(e.target.value);
    validateInput(e);
  };

  const handleCheckbox = e => {
    setCheckboxValue(!checkboxValue);
    validateInput(e);
  };

  const handleRadio = e => {
    setRadioValue(e.target.value);
    validateInput(e);
  };

  const validateInput = e => {
    e.target.parentNode.classList.add("was-validated");
  };

  const validateForm = () => {
    // Perform advanced validation here
    if (
      inputValue.length > 0 &&
      selectValue.length > 0 &&
      checkboxValue === true &&
      radioValue.length > 0
    ) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  };

  useEffect(() => {
    validateForm();
  });

  const handleSubmit = e => {
    e.preventDefault();
    console.log("Submitted valid form");
  };

  return (
    <Box p={4}>
      <Box>
        <Form onSubmit={handleSubmit} validated={formValidated}>
          <Flex mx={-3} flexWrap={"wrap"}>
            <Box width={[1, 1, 1/2]} px={3}>
              <Field label="Plain Input" validated={validated} width={1}>
                <Input
                  type="text"
                  required // set required attribute to use brower's HTML5 input validation
                  onChange={handleInput}
                  value={inputValue}
                  width={1}
                />
              </Field>
            </Box>
            <Box width={[1, 1, 1/2]} px={3}>
              <Field label="Form Email Input" validated={validated} width={1}>
                <Form.Input
                  type="email"
                  required // set required attribute to use brower's HTML5 input validation
                  onChange={handleFormInput}
                  value={formInputValue}
                  width={1}
                />
              </Field>
            </Box>
          </Flex>
          <Flex mx={-3} flexWrap={"wrap"}>
            <Box width={[1, 1, 1/2]} px={3}>
              <Field label="Select Input" validated={validated} width={1}>
                <Select
                  options={[
                    { value: "", label: ""},
                    { value: "eth", label: "Ethereum" },
                    { value: "btc", label: "Bitcoin" },
                    { value: "gno", label: "Gnosis" },
                    { value: "gnt", label: "Golem" },
                    { value: "rep", label: "Augur" }
                  ]}
                  value={selectValue}
                  onChange={handleSelect}
                  required // set required attribute to use brower's HTML5 input validation
                  width={1}
                />
              </Field>
            </Box>
          </Flex>
          
          
          <Box>
            <Field label="Checkbox Input" validated={validated}>
              <Form.Check
                value={checkboxValue}
                onChange={handleCheckbox}
                required // set required attribute to use brower's HTML5 input validation
              />
            </Field>
          </Box>
          <Box>
            <Field label="Radio Input" validated={validated}>
              <Radio
                label="Radio 1"
                my={2}
                value={"radio1"}
                checked={radioValue === "radio1"}
                onChange={handleRadio}
                required
              />
              <Radio
                label="Radio 2"
                my={2}
                value={"radio2"}
                checked={radioValue === "radio2"}
                onChange={handleRadio}
              />
              <Radio
                label="Radio 3"
                my={2}
                value={"radio3"}
                checked={radioValue === "radio3"}
                onChange={handleRadio}
              />
            </Field>
          </Box>
          <Box>
            {/* Use the validated state to update UI */}
            <Button type="submit" disabled={!validated}>
              Submit Form
            </Button>
          </Box>
        </Form>
      </Box>
      <Card my={4}>
        <Heading as={"h4"}>Form values</Heading>
        <Text>Valid form: {validated.toString()}</Text>
        <Text>Email value: {inputValue}</Text>
        <Text>Select value: {selectValue}</Text>
        <Text>Checkbox value: {checkboxValue.toString()}</Text>
        <Text>Radio value: {radioValue}</Text>
        <Checkbox
          label="Toggle Form Validation"
          value={formValidated}
          onChange={e => setFormValidated(!formValidated)}
        />
      </Card>
    </Box>
  );
}
