import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useAppContext } from "../../context/AppContext";

const assetDesign = {
    marginTop: "10px",
    height: "100vh",
    padding: "20px",
    backgroundColor: "#f4f6f8",

};

const assetContent = {
    maxHeight: "700px",
    overflowY: "auto",
}
const sectionHeader = {
    marginBottom: "10px",
    fontWeight: "bold",
    fontSize: "1.5rem",
};

const attachmentContainer = {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
};

const attachmentCard = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    backgroundColor: "#fafafa",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    marginBottom: "10px",
};

const fileNameStyle = {
    fontWeight: "bold",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

const buttonStyle = {
    padding: "6px 16px",
};

const imageStyle = {
    width: "100px",
    height: "100px",
    objectFit: "contain",
};

const pdfStyle = {
    width: "100px",
    height: "100px",
    border: "none",
};



const AssetInfo: React.FC = () => {
    const { singleStateData } = useAppContext();

    const basePath = "http://localhost:5000/uploads/";

    const getFileType = (fileName: string) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
            return "image";
        } else if (extension === "pdf") {
            return "pdf";
        }
        return "other";
    };

    const renderFile = (file: string) => {
        const fileType = getFileType(file);

        if (fileType === "image") {
            return <img src={`${basePath}${file}`} alt={file} style={imageStyle} />;
        } else if (fileType === "pdf") {
            return <iframe src={`${basePath}${file}`} title={file} style={pdfStyle}></iframe>;
        } else {
            return <Typography sx={fileNameStyle}>Unsupported file type</Typography>;
        }
    };

    const handleDownload = async (file: string, category: string, index: number) => {
        const fileName = `${category}_${index + 1}`;
        try {
            const response = await fetch(`${basePath}${file}`);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download file:", error);
        }
    };

    return (
        <Box sx={assetDesign}>
            <Box sx={assetContent} >
                <Typography variant="h5" gutterBottom>
                    Asset Attachments
                </Typography>

                {/* Images Section */}
                <Box sx={attachmentContainer}>
                    <Typography sx={sectionHeader} variant="h5">
                        Images
                    </Typography>
                    {singleStateData?.images && singleStateData.images.length > 0 ? (
                        singleStateData.images.map((image: string, index: number) => (
                            <Box sx={attachmentCard} key={index}>
                                {renderFile(image)}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={buttonStyle}
                                    onClick={() => handleDownload(image, "image", index)}
                                >
                                    Download
                                </Button>
                            </Box>
                        ))
                    ) : (
                        <Typography>No images attached</Typography>
                    )}
                </Box>

                <Box sx={{ margin: "20px 0" }} />

                {/* Invoices Section */}
                <Box sx={attachmentContainer}>
                    <Typography sx={sectionHeader} variant="h5">
                        Invoices
                    </Typography>
                    {singleStateData?.invoices && singleStateData.invoices.length > 0 ? (
                        singleStateData.invoices.map((invoice: string, index: number) => (
                            <Box sx={attachmentCard} key={index}>
                                {renderFile(invoice)}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={buttonStyle}
                                    onClick={() => handleDownload(invoice, "invoice", index)}
                                >
                                    Download
                                </Button>
                            </Box>
                        ))
                    ) : (
                        <Typography>No invoices attached</Typography>
                    )}
                </Box>

                <Box sx={{ margin: "20px 0" }} />

                {/* Manuals Section */}
                <Box sx={attachmentContainer}>
                    <Typography sx={sectionHeader}>Manuals</Typography>
                    {singleStateData?.manuals && singleStateData.manuals.length > 0 ? (
                        singleStateData.manuals.map((manual: string, index: number) => (
                            <Box sx={attachmentCard} key={index}>
                                {renderFile(manual)}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={buttonStyle}
                                    onClick={() => handleDownload(manual, "manual", index)}
                                >
                                    Download
                                </Button>
                            </Box>
                        ))
                    ) : (
                        <Typography>No manuals attached</Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default AssetInfo;
