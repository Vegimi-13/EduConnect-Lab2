import categoryRepository from "../../persistence/repositories/FeedRepositories/categories.repository";

const categoryService = {

  // ─── GET ALL CATEGORIES ─────────────────

  async getAllCategories() {

    return categoryRepository.findAll();

  },

};

export default categoryService;