import * as yup from "yup";

const vacationValidationSchema = yup.object({
  vacationType: yup.string().required("Vacation type required."),
  userId: yup
    .string()
    .required("User ID is required.")
    .matches(/^[a-fA-F0-9]{24}$/, "Invalid user ID format."),

  startDate: yup
    .date()
    .required("Start date is required.")
    .typeError("Start date must be a valid date."),

  endDate: yup
    .date()
    .required("End date is required.")
    .typeError("End date must be a valid date.")
    .min(
      yup.ref("startDate"),
      "End date cannot be earlier than the start date."
    ),

  comments: yup
    .string()
    .required("Comments are required.")
    .max(500, "Comments cannot exceed 500 characters."),
});

export default vacationValidationSchema;
