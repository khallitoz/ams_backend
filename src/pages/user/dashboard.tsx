import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useTheme,
  SelectChangeEvent,
  Tooltip,
  alpha,
} from "@mui/material";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAppContext } from "@/context/AppContext";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { belzirAxiosGet } from "@/utils/axiosHelper";

// Define types for chart data
interface ChartDataItem {
  name: string;
  value: number;
}

interface PieChartProps {
  data: ChartDataItem[];
  colors: string[];
  width?: number;
  height?: number;
  title?: string;
}

interface SliceData extends ChartDataItem {
  path: string;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
}

interface CounterCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface DashboardData {
  totalAssets: number;
  totalHardwareAssets: number;
  totalSoftwareAssets: number;
  hardwareByType: ChartDataItem[];
  hardwareByStatus: ChartDataItem[];
  softwareByCategory: ChartDataItem[];
}

// Custom enhanced SVG Pie Chart component
const SimplePieChart: React.FC<PieChartProps> = ({
  data,
  colors,
  width = 300,
  height = 280,
  title,
}) => {
  const theme = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartWidth = width * 0.5; // Keep the 50/50 ratio
  const legendWidth = width * 0.5; // Keep the 50/50 ratio
  const radius = (Math.min(chartWidth, height) / 2) * 0.98; // Maintain high radius ratio
  const centerX = chartWidth / 2;
  const centerY = height / 2;
  const donutHoleRadius = radius * 0.45; // Slightly smaller hole for more pie area

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: height,
          width: width,
        }}
      >
        <Typography variant="body1" color="text.secondary" align="center">
          No data available
        </Typography>
      </Box>
    );
  }

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Special case: single item with 100%
  if (data.length === 1) {
    return (
      <Box sx={{ position: "relative", width, height, display: "flex" }}>
        <Box sx={{ width: chartWidth, position: "relative" }}>
          <svg width={chartWidth} height={height}>
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill={colors[0]}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
            />
            {/* Donut hole */}
            <circle
              cx={centerX}
              cy={centerY}
              r={donutHoleRadius}
              fill={theme.palette.background.paper}
            />
            {/* Percentage text in the center */}
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={theme.palette.text.primary}
              fontSize="20px"
              fontWeight="bold"
            >
              100%
            </text>
          </svg>
        </Box>

        {/* Legend - positioned to the right with minimal padding */}
        <Box
          sx={{
            width: legendWidth,
            maxHeight: height,
            overflowY: "auto",
            pl: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              p: 0.75,
              borderRadius: 1,
              transition: "all 0.3s ease",
              backgroundColor: alpha(colors[0], 0.1),
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: colors[0],
                mr: 1,
                flexShrink: 0,
                borderRadius: "50%",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                mr: 0.75,
                flexShrink: 0,
                fontSize: "0.85rem",
              }}
            >
              {data[0].name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="bold"
              sx={{
                fontSize: "0.85rem",
                flexShrink: 0,
              }}
            >
              {data[0].value} (100%)
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Calculate the slices for multiple items
  let startAngle = 0;
  const slices: SliceData[] = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const angle = percentage * 360;

    // Calculate the path for the slice
    const endAngle = startAngle + angle;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Outer arc
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    // Inner arc (for donut hole)
    const x3 = centerX + donutHoleRadius * Math.cos(endRad);
    const y3 = centerY + donutHoleRadius * Math.sin(endRad);
    const x4 = centerX + donutHoleRadius * Math.cos(startRad);
    const y4 = centerY + donutHoleRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    // Path for donut slice
    const path = [
      `M ${x1} ${y1}`, // Move to outer start point
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Outer arc
      `L ${x3} ${y3}`, // Line to inner end point
      `A ${donutHoleRadius} ${donutHoleRadius} 0 ${largeArc} 0 ${x4} ${y4}`, // Inner arc (counter-clockwise)
      "Z", // Close path
    ].join(" ");

    const result = {
      path,
      color: colors[index % colors.length],
      percentage,
      startAngle,
      endAngle,
      ...item,
    };

    startAngle = endAngle;
    return result;
  });

  return (
    <Box sx={{ position: "relative", width, height, display: "flex" }}>
      {/* Chart area */}
      <Box sx={{ width: chartWidth, position: "relative" }}>
        <svg width={chartWidth} height={height}>
          {/* Outer shadow for the entire chart */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
          </filter>

          <g filter="url(#shadow)">
            {slices.map((slice, index) => {
              const isHovered = hoveredIndex === index;
              // Calculate offset for hover effect
              const hoverOffset = isHovered ? 8 : 0;
              const midAngle = (slice.startAngle + slice.endAngle) / 2;
              const midRad = (midAngle - 90) * (Math.PI / 180);
              const offsetX = hoverOffset * Math.cos(midRad);
              const offsetY = hoverOffset * Math.sin(midRad);

              return (
                <path
                  key={index}
                  d={slice.path}
                  fill={slice.color}
                  stroke={theme.palette.background.paper}
                  strokeWidth={1}
                  transform={
                    isHovered ? `translate(${offsetX}, ${offsetY})` : ""
                  }
                  style={{
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    opacity:
                      hoveredIndex !== null && hoveredIndex !== index ? 0.7 : 1,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Donut hole */}
            <circle
              cx={centerX}
              cy={centerY}
              r={donutHoleRadius}
              fill={theme.palette.background.paper}
            />

            {/* Total in the center */}
            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={theme.palette.text.secondary}
              fontSize="12px"
            >
              Total
            </text>
            <text
              x={centerX}
              y={centerY + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={theme.palette.text.primary}
              fontSize="16px"
              fontWeight="bold"
            >
              {total}
            </text>
          </g>
        </svg>
      </Box>

      {/* Legend - positioned to the right with minimal padding */}
      <Box
        sx={{
          width: legendWidth,
          maxHeight: height,
          overflowY: "auto",
          pl: 0.5,
        }}
      >
        {slices.map((slice, index) => (
          <Tooltip
            key={index}
            title={`${slice.name}: ${slice.value} (${(
              slice.percentage * 100
            ).toFixed(1)}%)`}
            arrow
            placement="right"
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
                mb: 0.5,
                p: 0.5,
                borderRadius: 1,
                transition: "all 0.3s ease",
                backgroundColor:
                  hoveredIndex === index
                    ? alpha(slice.color, 0.1)
                    : "transparent",
                "&:hover": {
                  backgroundColor: alpha(slice.color, 0.1),
                  transform: "translateX(3px)",
                },
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: slice.color,
                  mr: 0.5,
                  flexShrink: 0,
                  borderRadius: "50%",
                  boxShadow:
                    hoveredIndex === index
                      ? `0 0 0 2px ${alpha(slice.color, 0.3)}`
                      : "none",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mr: 0.5,
                  fontWeight: hoveredIndex === index ? 600 : 500,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: 1.2,
                }}
              >
                {slice.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={hoveredIndex === index ? "bold" : "normal"}
                sx={{
                  fontSize: "0.8rem",
                  flexShrink: 0,
                  lineHeight: 1.2,
                }}
              >
                {slice.value} ({(slice.percentage * 100).toFixed(0)}%)
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

// Simple counter card component
const CounterCard: React.FC<CounterCardProps> = ({
  title,
  count,
  icon,
  color,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      sx={{
        minHeight: 120,
        borderLeft: `5px solid ${color}`,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
          cursor: "pointer",
        },
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="subtitle1">
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                transition: "all 0.3s ease",
                color: isHovered ? color : "inherit",
                fontWeight: isHovered ? "bold" : "normal",
              }}
            >
              {count}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              width: 50,
              height: 50,
              color,
              transition: "all 0.3s ease",
              transform: isHovered ? "scale(1.1)" : "scale(1)",
              boxShadow: isHovered ? `0 0 10px ${alpha(color, 0.5)}` : "none",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Dashboard component
const Dashboard: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { token } = useAppContext();

  // State for dashboard data
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAssets: 0,
    totalHardwareAssets: 0,
    totalSoftwareAssets: 0,
    hardwareByType: [],
    hardwareByStatus: [],
    softwareByCategory: [],
  });

  // State for date filter
  const [dateRange, setDateRange] = useState<string>("all");

  // Colors for charts - more consistent color scheme
  const assetTypeColors = [
    "#3f51b5",
    "#f44336",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#2196f3",
    "#ffeb3b",
    "#795548",
    "#607d8b",
    "#e91e63",
  ];

  const statusColors = ["#4caf50", "#ff9800", "#f44336", "#9c27b0"];

  const categoryColors = [
    "#2196f3",
    "#ff9800",
    "#e91e63",
    "#03a9f4",
    "#8bc34a",
    "#673ab7",
    "#cddc39",
    "#3f51b5",
    "#ffeb3b",
    "#009688",
  ];

  // Function to fetch dashboard data
  const fetchDashboardData = async (range = "all") => {
    setLoading(true);
    try {
      // Fetch counters
      const countersResponse = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/dashboard/counters?dateRange=${range}`
      );

      // Fetch hardware by type
      const hardwareTypeResponse = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/dashboard/hardware-by-type?dateRange=${range}`
      );

      // Fetch hardware by status
      const hardwareStatusResponse = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/dashboard/hardware-by-status?dateRange=${range}`
      );

      // Fetch software by category
      const softwareCategoryResponse = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/dashboard/software-by-category?dateRange=${range}`
      );

      // Use real data if available, otherwise use mock data
      setDashboardData({
        totalAssets: countersResponse?.data?.totalAssets || 0,
        totalHardwareAssets: countersResponse?.data?.totalHardwareAssets || 0,
        totalSoftwareAssets: countersResponse?.data?.totalSoftwareAssets || 0,
        hardwareByType: hardwareTypeResponse?.data?.data || [
          { name: "Computer", value: 0 },
          { name: "Printer", value: 0 },
          { name: "Audio Visual", value: 0 },
          { name: "Telephone", value: 0 },
          { name: "Network Device", value: 0 },
          { name: "Furniture", value: 0 },
          { name: "Vehicle", value: 0 },
          { name: "Equipment", value: 0 },
        ],
        hardwareByStatus: hardwareStatusResponse?.data?.data || [
          { name: "In Service", value: 0 },
          { name: "Inactive", value: 0 },
          { name: "Check In", value: 0 },
          { name: "Check Out", value: 0 },
        ],
        softwareByCategory: softwareCategoryResponse?.data?.data || [
          { name: "Operating System", value: 0 },
          { name: "Database", value: 0 },
          { name: "Security", value: 0 },
          { name: "Office Suite", value: 0 },
          { name: "Development Tools", value: 0 },
        ],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle date range change
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    const newRange = event.target.value;
    setDateRange(newRange);
    fetchDashboardData(newRange);
  };

  // Handle view all clicks
  const handleViewAll = (section: string) => {
    switch (section) {
      case "hardware":
        router.push("/user/allassets");
        break;
      case "software":
        router.push("/user/softwareassets");
        break;
      case "all":
        router.push("/user/allassets");
        break;
      default:
        break;
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <Box
        className="dashboard-container"
        sx={{ p: 2 }}
        id="dashboardPrintArea"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            IT Assets Management Dashboard
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={handleDateRangeChange}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Counter Cards */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <CounterCard
                  title="All Assets"
                  count={dashboardData.totalAssets}
                  icon={<Box>💻</Box>}
                  color="#3f51b5"
                  onClick={() => handleViewAll("all")}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <CounterCard
                  title="Hardware Assets"
                  count={dashboardData.totalHardwareAssets}
                  icon={<Box>🖥️</Box>}
                  color="#f44336"
                  onClick={() => handleViewAll("hardware")}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <CounterCard
                  title="Software Assets"
                  count={dashboardData.totalSoftwareAssets}
                  icon={<Box>📊</Box>}
                  color="#4caf50"
                  onClick={() => handleViewAll("software")}
                />
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
              {/* Hardware by Type */}
              <Grid item xs={12} md={6} lg={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 1.5,
                    height: "100%",
                    minHeight: "340px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.75,
                      pb: 0.75,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                        fontSize: "1rem",
                      }}
                    >
                      Hardware Assets by Category
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewAll("hardware")}
                    >
                      View All
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexGrow: 1,
                      pt: 0.75,
                    }}
                  >
                    <SimplePieChart
                      data={dashboardData.hardwareByType}
                      colors={assetTypeColors}
                      title="Hardware by Category"
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Hardware by Status */}
              <Grid item xs={12} md={6} lg={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 1.5,
                    height: "100%",
                    minHeight: "340px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.75,
                      pb: 0.75,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                        fontSize: "1rem",
                      }}
                    >
                      Hardware Assets by Status
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewAll("hardware")}
                    >
                      View All
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexGrow: 1,
                      pt: 0.75,
                    }}
                  >
                    <SimplePieChart
                      data={dashboardData.hardwareByStatus}
                      colors={statusColors}
                      title="Hardware by Status"
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Software by Category */}
              <Grid item xs={12} md={6} lg={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 1.5,
                    height: "100%",
                    minHeight: "340px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.75,
                      pb: 0.75,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                        fontSize: "1rem",
                      }}
                    >
                      Software Assets by Category
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewAll("software")}
                    >
                      View All
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexGrow: 1,
                      pt: 0.75,
                    }}
                  >
                    <SimplePieChart
                      data={dashboardData.softwareByCategory}
                      colors={categoryColors}
                      title="Software by Category"
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {/* Print styles - hide elements when printing */}
        <style jsx global>{`
          @media print {
            nav,
            header,
            footer,
            button,
            .MuiAppBar-root,
            .MuiDrawer-root {
              display: none !important;
            }

            #dashboardPrintArea {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            body {
              background-color: white !important;
            }
          }
        `}</style>
      </Box>
    </Layout>
  );
};

export default Dashboard;
