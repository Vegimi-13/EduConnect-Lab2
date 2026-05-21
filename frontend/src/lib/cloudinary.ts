type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
};

function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  return {
    cloudName,
    uploadPreset,
  };
}

async function uploadImage(file: File) {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Image upload failed.");
  }

  const data = (await response.json()) as CloudinaryUploadResponse;
  return data.secure_url;
}

async function uploadImages(files: File[]) {
  return Promise.all(files.map((file) => uploadImage(file)));
}

export const cloudinaryApi = {
  uploadImage,
  uploadImages,
};
