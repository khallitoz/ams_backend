import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  SelectChangeEvent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { belzirAxiosGet } from "@/utils/axiosHelper";

interface Location {
  id: string;
  _id?: string;
  name: string;
  departments: Department[];
  buildings: Building[];
}

interface Department {
  id: string;
  name: string;
}

interface Building {
  id: string;
  name: string;
  rooms: Room[];
}

interface Room {
  id: string;
  name: string;
}

interface LocationDropdownsProps {
  value: {
    location: string;
    department: string;
    building: string;
    room: string;
  };
  onChange: (name: string, value: string) => void;
  errors?: {
    location?: string;
    department?: string;
    building?: string;
    room?: string;
  };
}

const LocationDropdowns: React.FC<LocationDropdownsProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Update departments when location changes
  useEffect(() => {
    if (value.location) {
      const selectedLocation = locations.find(
        (loc) => loc.id === value.location || loc._id === value.location
      );

      if (selectedLocation) {
        setDepartments(selectedLocation.departments || []);
        setBuildings(selectedLocation.buildings || []);
      } else {
        setDepartments([]);
        setBuildings([]);
      }

      // Reset department and building when location changes
      if (value.department || value.building || value.room) {
        onChange("department", "");
        onChange("building", "");
        onChange("room", "");
      }
    }
  }, [value.location, locations]);

  // Update rooms when building changes
  useEffect(() => {
    if (value.building) {
      const selectedLocation = locations.find(
        (loc) => loc.id === value.location || loc._id === value.location
      );

      if (selectedLocation) {
        const selectedBuilding = selectedLocation.buildings.find(
          (bldg) => bldg.id === value.building
        );

        if (selectedBuilding) {
          setRooms(selectedBuilding.rooms || []);
        } else {
          setRooms([]);
        }

        // Reset room when building changes
        if (value.room) {
          onChange("room", "");
        }
      }
    } else {
      setRooms([]);
    }
  }, [value.building, value.location, locations]);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await belzirAxiosGet(
        "http://localhost:4002/api/v1/locations/dropdown"
      );

      if (response.data && response.data.data) {
        setLocations(response.data.data);
      } else {
        setError("Failed to fetch locations data.");
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError(
        "An error occurred while fetching locations. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.location} size="small">
          <InputLabel>Location *</InputLabel>
          <Select
            name="location"
            value={value.location || ""}
            onChange={handleChange}
            label="Location *"
          >
            {locations.map((location) => (
              <MenuItem
                key={location.id || location._id}
                value={location.id || location._id}
              >
                {location.name}
              </MenuItem>
            ))}
          </Select>
          {errors.location && (
            <FormHelperText>{errors.location}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl
          fullWidth
          error={!!errors.department}
          disabled={!value.location}
          size="small"
        >
          <InputLabel>Department *</InputLabel>
          <Select
            name="department"
            value={value.department || ""}
            onChange={handleChange}
            label="Department *"
          >
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
          {errors.department && (
            <FormHelperText>{errors.department}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl
          fullWidth
          error={!!errors.building}
          disabled={!value.location}
          size="small"
        >
          <InputLabel>Building *</InputLabel>
          <Select
            name="building"
            value={value.building || ""}
            onChange={handleChange}
            label="Building *"
          >
            {buildings.map((building) => (
              <MenuItem key={building.id} value={building.id}>
                {building.name}
              </MenuItem>
            ))}
          </Select>
          {errors.building && (
            <FormHelperText>{errors.building}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl
          fullWidth
          error={!!errors.room}
          disabled={!value.building}
          size="small"
        >
          <InputLabel>Room *</InputLabel>
          <Select
            name="room"
            value={value.room || ""}
            onChange={handleChange}
            label="Room *"
          >
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name}
              </MenuItem>
            ))}
          </Select>
          {errors.room && <FormHelperText>{errors.room}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default LocationDropdowns;
