import searchRepository from "../../persistence/repositories/AdvancedSearch/search.repository";
import { SearchUsersQueryDtoType } from "../dto/AdvancedSearch/search.dto";
const searchService = {
  async searchUsers(data: SearchUsersQueryDtoType) {
    const users = await searchRepository.searchUsers(
      data.q,
      data.page,
      data.limit,
    );
    return users;
  },
};

export default searchService;
