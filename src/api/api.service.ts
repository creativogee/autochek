import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { subDays } from 'date-fns';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class ApiService {
  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Top 10 most occurring words in the titles of the last 25 stories
   * @param unique number of top most occurring words to return
   * @param story subset of stories
   * @returns
   */
  async getTopWordsFromLatestStories(unique: number, story: number) {
    const storyIDs = await this.fetchStoryIDs(story);

    const storyDetails = await this.fetchStoryDetails(storyIDs);

    const titles: string[] = storyDetails.map((story) => story.title);

    // Process titles, count word occurrences, and get top words
    const topWords = this.processTitlesAndGetTopWords(titles, unique);

    return topWords;
  }

  private fetchStoryIDs(chunk?: number): Promise<number[]> {
    const storyIDsObservable = this.httpService
      .get<number[]>(`${this.configService.get('BASE_URL')}/newstories.json`)
      .pipe(
        map((response) => {
          if (chunk) {
            return response.data.slice(0, chunk);
          }
          return response.data;
        }),
      );

    return lastValueFrom(storyIDsObservable);
  }

  private async fetchStoryDetails(
    storyIDs: number[],
    options?: { batchBy: number },
  ) {
    const storyDetailsObservables = storyIDs.map((storyID) =>
      this.httpService
        .get(`${this.configService.get('BASE_URL')}/item/${storyID}.json`)
        .pipe(
          map((response) => response.data),
          catchError(() => null),
        ),
    );

    const storyDetails = [];
    const chunk = options?.batchBy ?? 10;

    // map over the array of observables by batch
    for (let i = 0; i < storyDetailsObservables.length; i += chunk) {
      const storyDetailsChunk = await Promise.all(
        storyDetailsObservables
          .slice(i, i + chunk)
          .map((observable) => lastValueFrom(observable)),
      );

      storyDetails.push(...storyDetailsChunk);
    }

    return storyDetails;
  }

  private processTitlesAndGetTopWords(titles: string[], top: number) {
    const allWords = titles.join(' ').toLowerCase().split(/\W+/);

    const wordCountMap = {};

    allWords.forEach((word: string) => {
      // A word must be at least 2 characters long or be 'a' or 'i' to be counted
      if (word.length > 1 || word === 'a' || word === 'i') {
        wordCountMap[word] = (wordCountMap[word] || 0) + 1;
      }
    });

    const topWords = Object.keys(wordCountMap)
      .sort((a, b) => wordCountMap[b] - wordCountMap[a])
      .slice(0, top)
      .map((word) => ({ word, count: wordCountMap[word] }));

    return topWords;
  }

  /**
   * Top 10 most occurring words in the titles of the post of exactly the last week
   * @param unique number of top most occurring words to return
   * @returns
   */
  async getTopWordsFromLastWeek(unique: number) {
    const lastWeekStartDate = subDays(new Date(), 7);

    const storyDetails: any[] =
      await this.fetchStoryDetailsFromLastWeek(lastWeekStartDate);

    const titles: string[] = storyDetails.map((story) => story.title);

    // Process titles, count word occurrences, and get top words
    const topWords = this.processTitlesAndGetTopWords(titles, unique);

    return topWords;
  }

  private async fetchStoryDetailsFromLastWeek(
    startDate: Date,
  ): Promise<number[]> {
    const storyIDs = await this.fetchStoryIDs();

    const storyDetails = await this.fetchStoryDetails(storyIDs);

    return this.filterStoryDetailsByDate(storyDetails, startDate);
  }

  private filterStoryDetailsByDate(
    storyDetails: any[],
    startDate: Date,
  ): number[] {
    return storyDetails.filter((storyDetail) => {
      return storyDetail.time > startDate.getTime() / 1000;
    });
  }

  /**
   * Top 10 most occurring words in titles of the last 600 stories of users with at least 10.000 karma
   * @param unique number of top most occurring words to return
   * @param story stories subset
   * @param karma karma threshold
   * @returns
   */
  async getTopWordsForTopUsers(unique: number, story: number, karma: number) {
    const [userIDs, storyIDs] = await Promise.all([
      this.fetUserIDs(),
      this.fetchStoryIDs(),
    ]);

    // Get the user userDetails
    const usersDetails = await this.fetchUsersDetails(userIDs, {
      threshold: 5000,
      batchBy: 5,
    });

    // filter user by karma
    const topUsers = usersDetails.filter((user) => user.karma > karma);

    // console.log('Total Users: ', topUsers.length);

    const usersStoriesDetailsPromises = topUsers.map(async (user) => {
      // create a set of the user's submitted stories, comments, and polls
      const userStoryPollCommentSet = new Set(user.submitted);

      // filter out just the user stories from the set
      // and get the first stories e.g 600
      const userStories = storyIDs
        .filter((storyID) => userStoryPollCommentSet.has(storyID))
        .slice(0, story);

      return this.fetchStoryDetails(userStories);
    });

    const usersStoriesDetails = await Promise.all(usersStoriesDetailsPromises);

    const flatUsersStoriesDetails = usersStoriesDetails.flatMap(
      (innerArr) => innerArr,
    );

    // console.log('Total Stories: ', flatUsersStoriesDetails.length);

    const titles: string[] = flatUsersStoriesDetails.map(
      (story) => story.title,
    );

    // Process titles, count word occurrences, and get top words
    const topWords = this.processTitlesAndGetTopWords(titles, unique);

    return topWords;
  }

  private async fetUserIDs() {
    const updatesObservable = this.httpService
      .get<any>(`${this.configService.get('BASE_URL')}/updates.json`)
      .pipe(map((response) => response.data.profiles));

    return lastValueFrom(updatesObservable);
  }

  private async fetchUsersDetails(
    userIDs: number[],
    options: { batchBy?: number; threshold: number },
  ) {
    const userDetailsObservables = userIDs.map((userID) =>
      this.httpService
        .get(`${this.configService.get('BASE_URL')}/user/${userID}.json`)
        .pipe(
          map((response) => response.data),
          catchError(() => null),
        ),
    );

    const userDetails = [];
    const chunk = options?.batchBy ?? 10;

    for (let i = 0; i < userDetailsObservables.length; i += chunk) {
      const userDetailsChunk = await Promise.all(
        userDetailsObservables
          .slice(i, i + chunk)
          .map((observable) => lastValueFrom(observable)),
      );

      userDetails.push(...userDetailsChunk);
    }

    return userDetails;
  }
}
