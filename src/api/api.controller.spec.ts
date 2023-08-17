import { HttpModule } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';

describe('ApiController', () => {
  let controller: ApiController;
  let apiService: ApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      controllers: [ApiController],
      providers: [ApiService],
    }).compile();

    controller = module.get<ApiController>(ApiController);
    apiService = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPrevalentWords', () => {
    it('should return an array of prevalent words', async () => {
      const result = [];
      const unique = 10;
      const story = 25;

      jest
        .spyOn(apiService, 'getTopWordsFromLatestStories')
        .mockResolvedValue(result);

      expect(await controller.getPrevalentWords(unique, story)).toBe(result);
    });

    it('should throw an InternalServerErrorException when an error occurs', async () => {
      const unique = 10;
      const story = 25;

      jest
        .spyOn(apiService, 'getTopWordsFromLatestStories')
        .mockRejectedValue(new Error());

      await expect(controller.getPrevalentWords(unique, story)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getLasWeekPrevalentWords', () => {
    it('should return an array of prevalent words for the last week', async () => {
      const mockResult = [
        {
          word: 'a',
          count: 5,
        },
        {
          word: 'for',
          count: 5,
        },
      ];
      const unique = 10;

      jest
        .spyOn(apiService, 'getTopWordsFromLastWeek')
        .mockResolvedValue(mockResult);

      const result = await controller.getLasWeekPrevalentWords(unique);

      expect(result).toBe(mockResult);
    });

    it('should throw an InternalServerErrorException when an error occurs', async () => {
      const unique = 10;

      jest
        .spyOn(apiService, 'getTopWordsFromLastWeek')
        .mockRejectedValue(new Error());

      await expect(controller.getLasWeekPrevalentWords(unique)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getUsersFavoriteWords', () => {
    it('should return an array of favorite words for top users', async () => {
      const mockResult = [];
      const unique = 10;
      const story = 600;
      const karma = 10000;

      jest
        .spyOn(apiService, 'getTopWordsForTopUsers')
        .mockResolvedValue(mockResult);

      const result = await controller.getUsersFavoriteWords(
        unique,
        story,
        karma,
      );

      expect(result).toBe(mockResult);
    });

    it('should throw an InternalServerErrorException when an error occurs', async () => {
      const unique = 10;
      const story = 600;
      const karma = 10000;

      jest
        .spyOn(apiService, 'getTopWordsForTopUsers')
        .mockRejectedValue(new Error());

      await expect(
        controller.getUsersFavoriteWords(unique, story, karma),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
