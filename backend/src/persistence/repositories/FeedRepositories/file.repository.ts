import { prisma } from "../../../database/prismaClients";

interface CreateFileData {
  entity: string;
  entity_id: number;
  file_path: string;
  uploaded_by?: number | null;
}
function extractFilename(url: string): string {
  return url.split("/").pop() || "file";
}
const fileRepository = {
  async create(data: CreateFileData) {
    return prisma.file.create({
      data: {
        entity: data.entity,
        entity_id: data.entity_id,
        file_path: data.file_path,
        filename: extractFilename(data.file_path),
        ...(data.uploaded_by !== undefined &&{
          uploaded_by: data.uploaded_by
        })
      },
    });
  },

  async findByEntity(entity: string, entity_id: number) {
    return prisma.file.findMany({
      where: {
        entity,
        entity_id,
      },
    });
  },
};

export default fileRepository;
