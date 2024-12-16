import StyledTextField from "@/components/StyledTextField";
import FormSection from "./FormSection";
import { HardwareDetails } from "../forms/HardwareForm";

interface LocationFormProps {
  values: HardwareDetails;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  errors: { [key: string]: string };
}

const LocationForm: React.FC<LocationFormProps> = ({
  values,
  handleChange,
  errors,
}) => (
  <FormSection title="Location">
    <StyledTextField
      label="Assigned To"
      name="assignedTo"
      value={values.assignedTo}
      onChange={handleChange}
      error={errors.assignedTo}
    />
    <StyledTextField
      label="Location"
      name="location"
      value={values.location}
      onChange={handleChange}
      error={errors.location}
    />
    <StyledTextField
      label="Building"
      name="building"
      value={values.building}
      onChange={handleChange}
      error={errors.building}
    />
    <StyledTextField
      label="Room"
      name="room"
      value={values.room}
      onChange={handleChange}
      error={errors.room}
    />
    <StyledTextField
      label="Department"
      name="department"
      value={values.department}
      onChange={handleChange}
      error={errors.department}
    />
  </FormSection>
);

export default LocationForm;
