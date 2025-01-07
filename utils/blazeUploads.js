import { b2 } from "../config/backblaze.js";
import { nanoid } from "nanoid";

const uploadToBackblaze = async (field, files) => {
  const uploadedFiles = [];

  try {
    // Step 1: Get Upload URL and Authorization Token
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });
    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    console.log(" Successfully retrieved upload URL and token from Backblaze");

    // Step 2: Upload Files
    for (const file of files) {
      const uniqueFileName = `${nanoid()}-${file.originalname}`;
      console.log(` Uploading file: ${uniqueFileName}`);

      try {
        const uploadResponse = await b2.uploadFile({
          uploadUrl,
          uploadAuthToken: authorizationToken,
          fileName: `uploads/${field}/${uniqueFileName}`,
          data: file.buffer,
          mime: file.mimetype,
        });

        const fileUrl = `https://f003.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${uploadResponse.data.fileName}`;
        console.log(` File uploaded successfully: ${fileUrl}`);

        uploadedFiles.push(fileUrl);
      } catch (uploadError) {
        console.error(
          ` Failed to upload file ${file.originalname}:`,
          uploadError.response?.data || uploadError.message
        );
        throw new Error(
          `Failed to upload file ${file.originalname} to Backblaze`
        );
      }
    }

    return uploadedFiles;
  } catch (error) {
    console.error(
      " Error in uploadToBackblaze:",
      error.response?.data || error.message
    );
    throw new Error("Failed to upload files to Backblaze B2");
  }
};

export default uploadToBackblaze;
