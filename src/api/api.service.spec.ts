import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';

describe('ApiService', () => {
  let service: ApiService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      controllers: [ApiController],
      providers: [ApiService],
    }).compile();

    service = module.get<ApiService>(ApiService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTopWordsFromLatestStories', () => {
    it('should return top words from the latest stories', async () => {
      const mockStoryIDs = [1, 2, 3];
      const mockStoryDetails = [
        { title: 'ab' },
        { title: 'cd' },
        { title: 'ef' },
      ];
      const unique = 3;
      const story = 3;

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of({ data: mockStoryIDs } as AxiosResponse<number[]>));

      jest
        .spyOn(service as any, 'fetchStoryDetails')
        .mockResolvedValue(mockStoryDetails);

      jest
        .spyOn(service as any, 'processTitlesAndGetTopWords')
        .mockReturnValue([]);

      const result = await service.getTopWordsFromLatestStories(unique, story);

      expect(result).toEqual([]);
    });

    it('should throw an error if fetching story IDs fails', async () => {
      const unique = 3;
      const story = 3;

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of({ data: null } as AxiosResponse<number[]>));

      await expect(
        service.getTopWordsFromLatestStories(unique, story),
      ).rejects.toThrow();
    });
  });
});
