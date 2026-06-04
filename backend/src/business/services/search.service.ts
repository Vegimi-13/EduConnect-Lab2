import searchRepository from "../../persistence/repositories/AdvancedSearch/search.repository";
import { SearchQueryDtoType } from "../dto/AdvancedSearch/search.dto";
const searchService = {
  async searchUsers(data: SearchQueryDtoType) {
    const users = await searchRepository.searchUsers(
      data.q,
      data.page,
      data.limit,
    );
    return users;
  },
  async searchGroups(data: SearchQueryDtoType, viewerId: number) {
    const groups = await searchRepository.searchGroup(
      data.q,
      data.page,
      data.limit,
      viewerId,
    );
    return groups;
  },
  async searchInstitutions(data: SearchQueryDtoType) {
    const institutions = await searchRepository.searchInstitutions(
      data.q,
      data.page,
      data.limit,
    );
    return institutions;
  },

};

export default searchService;
