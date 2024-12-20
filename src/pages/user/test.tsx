import React from "react";

const ImageDownload = () => {
    const imageUrl = "http://localhost:3001/uploads/OTBVgNwLbL2NENwRAURIc.jpg"; // Replace with your image URL
    const fileName = "example-image.jpg"; // Desired download name

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl); // Fetch the image data
            const blob = await response.blob(); // Convert the response into a blob

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob); // Create a local URL for the blob
            link.setAttribute("download", fileName); // Set the download attribute
            document.body.appendChild(link); // Append to the DOM
            link.click(); // Trigger the download
            document.body.removeChild(link); // Remove the link element
        } catch (error) {
            console.error("Failed to download image:", error);
        }
    };

    return (
        <div>
            <img src={imageUrl} alt="Example" style={{ width: "150px", height: "150px" }} />
            <button onClick={handleDownload}>Download Image</button>
        </div>
    );
};

export default ImageDownload;
