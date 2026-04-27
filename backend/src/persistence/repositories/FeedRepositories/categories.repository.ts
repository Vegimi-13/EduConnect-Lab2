import { prisma } from "../../../database/prismaClients";

const categoryRepository = {

  // ─── GET ALL CATEGORIES ─────────────────

  async findAll() {

    return prisma.category.findMany({

      orderBy: {

        name: "asc", // clean sorting for UI

      },

    });

  },

};

export default categoryRepository;