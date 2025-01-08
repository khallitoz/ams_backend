export const validateHardwareForm = (
  values: any
): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  // Main form validations
  if (!values.assetName) newErrors.assetName = "Asset name is required.";
  if (!values.assetType) newErrors.assetType = "Asset type is required.";
  if (!values.condition) newErrors.condition = "Condition is required.";
  if (!values.price) {
    newErrors.price = "Price is required.";
  } else if (isNaN(Number(values.price)) || Number(values.price) <= 0) {
    newErrors.price = "Price must be a valid positive number.";
  }
  if (!values.warrantyDate)
    newErrors.warrantyDate = "Warranty date is required.";
  if (!values.warrantyType)
    newErrors.warrantyType = "Warranty type is required.";
  if (!values.category) newErrors.category = "Category is required.";
  if (!values.vendor) newErrors.vendor = "Vendor is required.";
  if (!values.serialNo) newErrors.serialNo = "Serial Number is required.";
  if (!values.modelNo) newErrors.modelNo = "Model number is required.";
  if (!values.model) newErrors.model = "Model is required.";
  if (!values.description) newErrors.description = "Description is required.";

  // Location form validation
  if (!values.assignedTo)
    newErrors.assignedTo = "Assigned To field is required.";
  if (!values.location) newErrors.location = "Location is required.";
  if (!values.building) newErrors.building = "Building is required.";
  if (!values.room) newErrors.room = "Room is required.";
  if (!values.department) newErrors.department = "Department is required.";

  // Regular expression for validating an IPv4 address
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

  // Computer details validation
  if (values.assetType === "Computer") {
    if (!values.computerDetails.os)
      newErrors["computerDetails.os"] = "Operating System is required.";
    if (!values.computerDetails.specificType)
      newErrors["computerDetails.specificType"] = "Specific Type is required.";
    if (!values.computerDetails.processor)
      newErrors["computerDetails.processor"] = "Processor is required.";
    if (!values.computerDetails.memory)
      newErrors["computerDetails.memory"] = "Memory is required.";
    if (!values.computerDetails.ipAddress) {
      newErrors["computerDetails.ipAddress"] = "IP Address is required.";
    } else if (!ipRegex.test(values.computerDetails.ipAddress)) {
      newErrors["computerDetails.ipAddress"] =
        "Invalid IP Address. Example: 192.168.1.1";
    }
  }

  // Switch details validation
  if (values.assetType === "Network") {
    if (!values.networkDevice.os)
      newErrors["networkDevice.os"] = "Operating System is required.";
    if (!values.networkDevice.osVersion)
      newErrors["networkDevice.osVersion"] = "OS Version is required.";
    if (!values.networkDevice.ipAddress) {
      newErrors["networkDevice.ipAddress"] = "IP Address is required.";
    } else if (!ipRegex.test(values.networkDevice.ipAddress)) {
      newErrors["networkDevice.ipAddress"] =
        "Invalid IP Address. Example: 192.168.1.1";
    }
  }

  // Router details validation
  if (values.assetType === "Router") {
    if (!values.routerDetails.os)
      newErrors["routerDetails.os"] = "Operating System is required.";
    if (!values.routerDetails.osVersion)
      newErrors["routerDetails.osVersion"] = "OS Version is required.";
    if (!values.routerDetails.ipAddress) {
      newErrors["routerDetails.ipAddress"] = "IP Address is required.";
    } else if (!ipRegex.test(values.routerDetails.ipAddress)) {
      newErrors["routerDetails.ipAddress"] =
        "Invalid IP Address. Example: 192.168.1.1";
    }
  }

  return newErrors;
};
