import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get('/recent')
  async getPrevalentWords(
    @Query('unique-word') unique: number = 10,
    @Query('story-size') story: number = 25,
  ) {
    try {
      return await this.apiService.getTopWordsFromLatestStories(unique, story);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching data from Hacker News API',
      );
    }
  }

  @Get('/last-week')
  async getLasWeekPrevalentWords(@Query('unique-word') unique: number = 10) {
    try {
      return await this.apiService.getTopWordsFromLastWeek(unique);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching data from Hacker News API',
      );
    }
  }

  @Get('/users-fav-word')
  async getUsersFavoriteWords(
    @Query('unique-word') unique: number = 10,
    @Query('story-size') story: number = 600,
    @Query('karma') karma: number = 10000,
  ) {
    try {
      return await this.apiService.getTopWordsForTopUsers(unique, story, karma);
    } catch (error) {
      // console.log(error);
      throw new InternalServerErrorException(
        'Error while fetching data from Hacker News API',
      );
    }
  }
}
