import twitter from 'twitter';
import { from, of } from 'rxjs'
import { 
    switchMap, 
    catchError,
    map
 } from 'rxjs/operators';
import fetch from 'node-fetch';

interface NewsData {
    date: string;
    title: string;
    url: string;
}

declare var process : {
    env: {
        TWITTER_CONSUME_KEY: string,
        TWITEER_CONSUME_SECRET: string,
        TWITTER_ACCESS_TOKEN_KEY: string,
        TWITTER_ACCESS_TOKEN_SECRET: string
    }
  }

const client = new twitter({
    consumer_key        : process.env.TWITTER_CONSUME_KEY,
    consumer_secret     : process.env.TWITEER_CONSUME_SECRET,
    access_token_key    : process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret : process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const url = "https://raw.githubusercontent.com/sassy/momoclo-news-crawler/master/data/news.json";

const stream$ = from(fetch(url)).pipe(
    switchMap(response => {
        if (response.ok) {
            return response.json()
        }
        return of({error: true, message: "response error"})
    }),
    catchError(err => {
        console.error(err);
        return of({error: true, message: err.message});
    })
);


stream$.pipe(
    map(json => {
        const updated = json.updated;
        return json.news.filter((data: NewsData)  => {
            return data.date === updated
        })
    }),
).subscribe(
    (result: NewsData[]) => {
        result.forEach((data: NewsData) => {
            const status = data.date + `\n` + data.title + `\n` + data.url;
            const params :twitter.RequestParams = {
                status: status
            };
            client.post('statuses/update', 
                params, 
                 (error, tweet) => {
                    if (!error) {
                        console.log(tweet);
                    } else {
                        console.error(error);
                    }
                }
            );
        });   
    }
);
