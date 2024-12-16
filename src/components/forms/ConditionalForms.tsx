import React from "react";
import FormSection from "@/components/forms/FormSection";
import StyledTextField from "@/components/StyledTextField";

// Import or define relevant interfaces for props
import { HardwareDetails } from "@/components/forms/HardwareForm"; // Adjust the import path accordingly

interface ConditionalFormProps {
  values: HardwareDetails;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  errors: { [key: string]: string };
}

export const SwitchForm: React.FC<ConditionalFormProps> = ({
  values,
  handleChange,
  errors,
}) => (
  <FormSection title="Switch Details">
    <StyledTextField
      label="Operating System"
      name="switchDetails.os"
      value={values.switchDetails.os}
      onChange={handleChange}
      error={errors["switchDetails.os"]}
      helperText={errors["switchDetails.os"]}
    />
    <StyledTextField
      label="OS Version"
      name="switchDetails.osVersion"
      value={values.switchDetails.osVersion}
      onChange={handleChange}
      error={errors["switchDetails.osVersion"]}
      helperText={errors["switchDetails.osVersion"]}
    />
    <StyledTextField
      label="IP Address"
      name="switchDetails.ipAddress"
      value={values.switchDetails.ipAddress}
      onChange={handleChange}
      error={errors["switchDetails.ipAddress"]}
      helperText={errors["switchDetails.ipAddress"]}
    />
  </FormSection>
);

export const ComputerDetailsForm: React.FC<ConditionalFormProps> = ({
  values,
  handleChange,
  errors,
}) => (
  <FormSection title="Computer Details">
    <StyledTextField
      label="Operating System"
      name="computerDetails.os"
      value={values.computerDetails.os}
      onChange={handleChange}
      error={errors["computerDetails.os"]}
      helperText={errors["computerDetails.os"]}
    />
    <StyledTextField
      label="Specific Type"
      name="computerDetails.specificType"
      value={values.computerDetails.specificType}
      onChange={handleChange}
      error={errors["computerDetails.specificType"]}
      helperText={errors["computerDetails.specificType"]}
    />
    <StyledTextField
      label="Processor"
      name="computerDetails.processor"
      value={values.computerDetails.processor}
      onChange={handleChange}
      error={errors["computerDetails.processor"]}
      helperText={errors["computerDetails.processor"]}
    />
    <StyledTextField
      label="Memory"
      name="computerDetails.memory"
      value={values.computerDetails.memory}
      onChange={handleChange}
      error={errors["computerDetails.memory"]}
      helperText={errors["computerDetails.memory"]}
    />
    <StyledTextField
      label="IP Address"
      name="computerDetails.ipAddress"
      value={values.computerDetails.ipAddress}
      onChange={handleChange}
      error={errors["computerDetails.ipAddress"]}
      helperText={errors["computerDetails.ipAddress"]}
    />
  </FormSection>
);

export const RouterDetailsForm: React.FC<ConditionalFormProps> = ({
  values,
  handleChange,
  errors,
}) => (
  <FormSection title="Router Details">
    <StyledTextField
      label="Operating System"
      name="routerDetails.os"
      value={values.routerDetails.os}
      onChange={handleChange}
      error={errors["routerDetails.os"]}
      helperText={errors["routerDetails.os"]}
    />
    <StyledTextField
      label="OS Version"
      name="routerDetails.osVersion"
      value={values.routerDetails.osVersion}
      onChange={handleChange}
      error={errors["routerDetails.osVersion"]}
      helperText={errors["routerDetails.osVersion"]}
    />
    <StyledTextField
      label="IP Address"
      name="routerDetails.ipAddress"
      value={values.routerDetails.ipAddress}
      onChange={handleChange}
      error={errors["routerDetails.ipAddress"]}
      helperText={errors["routerDetails.ipAddress"]}
    />
  </FormSection>
);
