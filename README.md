## Getting Started

1.  Clone the repository:

    ```bash
    git clone http://github.com/creativogee/autochek.git
    cd autochek
    ```

2.  Install the dependencies using Yarn:

    ```bash
    yarn install
    ```

3.  Configure Environment

    ```bash
    # .env
    BASE_URL=https://hacker-news.firebaseio.com/v0
    ```

4.  Running the App:

    To start the app locally, run:

    ```bash
    yarn start
    ```

    The app will be accessible at http://localhost:4242.

5.  Running Tests:

         To run tests, use:

         ```bash
         yarn test
         ```
         This will execute all the tests in the application.

6.  Usage
    /api/recent: Retrieve the top most occurring words in the titles of the latest stories.

    Example: http://localhost:4242/api/recent?unique-word=10&story-size=25

    /api/last-week: Retrieve the top most occurring words in the titles of the stories from the last week.

    Example: http://localhost:4242/api/last-week?unique-word=10

    /api/users-fav-word: Retrieve the top most occurring words in the titles of stories submitted by users with high karma.

    Example: http://localhost:4242/api/users-fav-word?unique-word=10&story-size=600&karma=10000

Thank you for your time.
