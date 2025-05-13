import { StatusCodes } from "http-status-codes";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all employees with pagination and search
 */
export const getAllEmployees = async (req, res) => {
  try {
    const Employee = req.models.Employee;

    const page = Number(req.query.page) || 1; // 1-based index
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.searchQuery || ""; // Retrieve the search query

    // If there's a search query, apply filtering
    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
            { phone: { $regex: searchQuery, $options: "i" } },
            { department: { $regex: searchQuery, $options: "i" } },
            { position: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {}; // No filter if searchQuery is empty

    // Apply filtering and pagination
    const employees = await Employee.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const totalEmployees = await Employee.countDocuments(searchFilter); // Total matching employees count

    res.status(StatusCodes.OK).json({
      success: true,
      data: employees,
      totalEmployees,
      numberOfPages: Math.ceil(totalEmployees / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching employees:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while fetching employees.",
      error: error.message,
    });
  }
};

/**
 * Get a single employee by ID
 */
export const getEmployeeById = async (req, res) => {
  try {
    const Employee = req.models.Employee;
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No employee found with id: ${id}`,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee by ID:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while fetching employee.",
      error: error.message,
    });
  }
};

/**
 * Create a new employee
 */
export const createEmployee = async (req, res) => {
  try {
    const Employee = req.models.Employee;
    const employeeData = req.body;

    // Check if employee with this email already exists
    const existingEmployee = await Employee.findOne({
      email: employeeData.email,
    });
    if (existingEmployee) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "An employee with this email already exists.",
      });
    }

    const employee = new Employee(employeeData);
    const savedEmployee = await employee.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Employee created successfully.",
      data: savedEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error.message);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while creating employee.",
      error: error.message,
    });
  }
};

/**
 * Update an employee by ID
 */
export const updateEmployee = async (req, res) => {
  try {
    const Employee = req.models.Employee;
    const { id } = req.params;
    const employeeData = req.body;

    // Find employee by ID
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No employee found with id: ${id}`,
      });
    }

    // Check if updated email already exists in another employee
    if (employeeData.email !== employee.email) {
      const existingEmployee = await Employee.findOne({
        email: employeeData.email,
        _id: { $ne: id }, // Exclude current employee from check
      });

      if (existingEmployee) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "An employee with this email already exists.",
        });
      }
    }

    // Update the employee
    const updatedEmployee = await Employee.findByIdAndUpdate(id, employeeData, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Employee updated successfully.",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error.message);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while updating employee.",
      error: error.message,
    });
  }
};

/**
 * Delete an employee by ID
 */
export const deleteEmployee = async (req, res) => {
  try {
    const Employee = req.models.Employee;
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No employee found with id: ${id}`,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Employee deleted successfully.",
      data: employee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while deleting employee.",
      error: error.message,
    });
  }
};

/**
 * Generate an Excel template for employee import
 */
export const getEmployeeTemplate = async (req, res) => {
  try {
    // Define template headers with example data
    const templateData = [
      {
        Name: "John Smith",
        Email: "john.smith@company.com",
        Phone: "+1-555-123-4567",
        Department: "IT",
        Position: "Software Engineer",
        "Join Date (YYYY-MM-DD)": "2023-01-15",
      },
      {
        Name: "Jane Doe",
        Email: "jane.doe@company.com",
        Phone: "+1-555-987-6543",
        Department: "HR",
        Position: "HR Manager",
        "Join Date (YYYY-MM-DD)": "2022-06-10",
      },
      {
        Name: "",
        Email: "",
        Phone: "",
        Department: "",
        Position: "",
        "Join Date (YYYY-MM-DD)": "",
      },
    ];

    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Create workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Employees");

    // Generate buffer
    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employee_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error generating template:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while generating template.",
      error: error.message,
    });
  }
};

/**
 * Import employees from Excel file
 */
export const importEmployeesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No file uploaded. Please upload an Excel file.",
      });
    }

    const Employee = req.models.Employee;
    const filePath = req.file.path;

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Delete the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    if (!data || data.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "The uploaded Excel file is empty or in an incorrect format.",
      });
    }

    const results = {
      success: [],
      errors: [],
    };

    // Process each row in the Excel file
    for (const row of data) {
      try {
        // Map column names to our expected field names
        const employeeData = {
          name: row.Name || row.name,
          email: row.Email || row.email,
          phone: row.Phone || row.phone || "",
          department: row.Department || row.department || "",
          position: row.Position || row.position || "",
          joinDate: row["Join Date (YYYY-MM-DD)"] || row.joinDate || null,
        };

        // Validate required fields
        if (!employeeData.name || !employeeData.email) {
          results.errors.push({
            row,
            error: "Missing required fields (Name, Email).",
          });
          continue;
        }

        // Check if the employee with this email already exists
        const existingEmployee = await Employee.findOne({
          email: employeeData.email,
        });

        if (existingEmployee) {
          // Update existing employee
          await Employee.updateOne(
            { email: employeeData.email },
            { $set: employeeData }
          );
        } else {
          // Create new employee
          const employee = new Employee(employeeData);
          await employee.save();
        }

        results.success.push(row);
      } catch (error) {
        console.error("Error processing row:", error.message);
        results.errors.push({
          row,
          error: error.message,
        });
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Import completed.",
      data: {
        totalRows: data.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error("Error importing from Excel:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred during import.",
      error: error.message,
    });
  }
};
