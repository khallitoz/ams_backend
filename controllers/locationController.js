import { StatusCodes } from "http-status-codes";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all locations with pagination and search
 */
export const getAllLocations = async (req, res) => {
  try {
    const Location = req.models.Location;

    const page = Number(req.query.page) || 1; // 1-based index
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.searchQuery || ""; // Retrieve the search query

    // If there's a search query, apply filtering
    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { "departments.name": { $regex: searchQuery, $options: "i" } },
            { "buildings.name": { $regex: searchQuery, $options: "i" } },
            { "buildings.rooms.name": { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {}; // No filter if searchQuery is empty

    // Apply filtering and pagination
    const locations = await Location.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const totalLocations = await Location.countDocuments(searchFilter); // Total matching locations count

    res.status(StatusCodes.OK).json({
      success: true,
      data: locations,
      totalLocations,
      numberOfPages: Math.ceil(totalLocations / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching locations:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while fetching locations.",
      error: error.message,
    });
  }
};

/**
 * Get a single location by ID
 */
export const getLocationById = async (req, res) => {
  try {
    const Location = req.models.Location;
    const { id } = req.params;

    const location = await Location.findById(id);

    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No location found with id: ${id}`,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Error fetching location by ID:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while fetching location.",
      error: error.message,
    });
  }
};

/**
 * Create a new location
 */
export const createLocation = async (req, res) => {
  try {
    const Location = req.models.Location;
    const locationData = req.body;

    console.log(locationData);
    // Check if location with this name already exists
    const existingLocation = await Location.findOne({
      name: locationData.name,
    });
    if (existingLocation) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "A location with this name already exists.",
      });
    }

    const location = new Location(locationData);
    const savedLocation = await location.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Location created successfully.",
      data: savedLocation,
    });
  } catch (error) {
    console.error("Error creating location:", error.message);

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
      message: "Server error occurred while creating location.",
      error: error.message,
    });
  }
};

/**
 * Update a location by ID
 */
export const updateLocation = async (req, res) => {
  try {
    const Location = req.models.Location;
    const { id } = req.params;
    const locationData = req.body;

    // Find location by ID
    const location = await Location.findById(id);

    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No location found with id: ${id}`,
      });
    }

    // Check if updated name already exists in another location
    if (locationData.name !== location.name) {
      const existingLocation = await Location.findOne({
        name: locationData.name,
        _id: { $ne: id }, // Exclude current location from check
      });

      if (existingLocation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "A location with this name already exists.",
        });
      }
    }

    // Update the location
    const updatedLocation = await Location.findByIdAndUpdate(id, locationData, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Location updated successfully.",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Error updating location:", error.message);

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
      message: "Server error occurred while updating location.",
      error: error.message,
    });
  }
};

/**
 * Delete a location by ID
 */
export const deleteLocation = async (req, res) => {
  try {
    const Location = req.models.Location;
    const { id } = req.params;

    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No location found with id: ${id}`,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Location deleted successfully.",
      data: location,
    });
  } catch (error) {
    console.error("Error deleting location:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while deleting location.",
      error: error.message,
    });
  }
};

/**
 * Add a department to a building
 */
export const addDepartmentToLocation = async (req, res) => {
  try {
    const Location = req.models.Location;
    const { id, buildingId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Department name is required.",
      });
    }

    const location = await Location.findById(id);

    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No location found with id: ${id}`,
      });
    }

    // Find the building
    const building = location.buildings.id(buildingId);

    if (!building) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No building found with id: ${buildingId}`,
      });
    }

    // Check if department name already exists in this building
    const departmentExists = building.departments.some(
      (department) => department.name.toLowerCase() === name.toLowerCase()
    );

    if (departmentExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "A department with this name already exists in this building.",
      });
    }

    // Add department to building
    building.departments.push({ name });
    await location.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Department added successfully to building.",
      data: building.departments[building.departments.length - 1],
    });
  } catch (error) {
    console.error("Error adding department to building:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while adding department to building.",
      error: error.message,
    });
  }
};

/**
 * Add a building to a location
 */
export const addBuildingToLocation = async (req, res) => {
  try {
    const Location = req.models.Location;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Building name is required.",
      });
    }

    const location = await Location.findById(id);

    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No location found with id: ${id}`,
      });
    }

    // Check if building name already exists
    const buildingExists = location.buildings.some(
      (building) => building.name.toLowerCase() === name.toLowerCase()
    );

    if (buildingExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "A building with this name already exists in this location.",
      });
    }

    // Add building to location
    location.buildings.push({ name, rooms: [] });
    await location.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Building added successfully.",
      data: location.buildings[location.buildings.length - 1],
    });
  } catch (error) {
    console.error("Error adding building to location:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while adding building to location.",
      error: error.message,
    });
  }
};

/**
 * Add a room to a department
 */
export const addRoomToBuilding = async (req, res) => {
  try {
    const Location = req.models.Location;
    const { locationId, buildingId, departmentId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Room name is required.",
      });
    }

    const location = await Location.findById(locationId);

    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No location found with id: ${locationId}`,
      });
    }

    // Find the building
    const building = location.buildings.id(buildingId);

    if (!building) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No building found with id: ${buildingId}`,
      });
    }

    // Find the department
    const department = building.departments.id(departmentId);

    if (!department) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No department found with id: ${departmentId}`,
      });
    }

    // Check if room name already exists in this department
    const roomExists = department.rooms.some(
      (room) => room.name.toLowerCase() === name.toLowerCase()
    );

    if (roomExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "A room with this name already exists in this department.",
      });
    }

    // Add room to department
    department.rooms.push({ name });
    await location.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Room added successfully.",
      data: department.rooms[department.rooms.length - 1],
    });
  } catch (error) {
    console.error("Error adding room to department:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while adding room to department.",
      error: error.message,
    });
  }
};

/**
 * Import locations from Excel file
 */
export const importLocationsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No file uploaded. Please upload an Excel file.",
      });
    }

    const Location = req.models.Location;
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
        // Validate required fields
        if (!row.Location || !row.Building || !row.Department || !row.Room) {
          results.errors.push({
            row,
            error:
              "Missing required fields (Location, Building, Department, or Room).",
          });
          continue;
        }

        // Check if the location exists, create if not
        let location = await Location.findOne({ name: row.Location });

        if (!location) {
          location = new Location({
            name: row.Location,
            buildings: [],
          });
        }

        // Check if building exists
        let building = location.buildings.find(
          (b) => b.name.toLowerCase() === row.Building.toLowerCase()
        );

        if (!building) {
          // Add new building with department and room
          location.buildings.push({
            name: row.Building,
            departments: [
              {
                name: row.Department,
                rooms: [{ name: row.Room }],
              },
            ],
          });
        } else {
          // Check if department exists in building
          let department = building.departments.find(
            (d) => d.name.toLowerCase() === row.Department.toLowerCase()
          );

          if (!department) {
            // Add new department with room to existing building
            building.departments.push({
              name: row.Department,
              rooms: [{ name: row.Room }],
            });
          } else {
            // Check if room exists in department
            const roomExists = department.rooms.some(
              (r) => r.name.toLowerCase() === row.Room.toLowerCase()
            );

            if (!roomExists) {
              // Add room to existing department
              department.rooms.push({ name: row.Room });
            }
          }
        }

        await location.save();
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

/**
 * Get locations with dropdowns for UI
 */
export const getLocationsForDropdown = async (req, res) => {
  try {
    const Location = req.models.Location;
    const locations = await Location.find({}, "name buildings");

    // Format the response to be easily used in frontend dropdowns
    const formattedLocations = locations.map((location) => {
      return {
        id: location._id,
        name: location.name,
        buildings: location.buildings.map((building) => ({
          id: building._id,
          name: building.name,
          departments: building.departments.map((dept) => ({
            id: dept._id,
            name: dept.name,
            rooms: dept.rooms.map((room) => ({
              id: room._id,
              name: room.name,
            })),
          })),
        })),
      };
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: formattedLocations,
    });
  } catch (error) {
    console.error("Error fetching dropdown locations:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred while fetching locations for dropdown.",
      error: error.message,
    });
  }
};
