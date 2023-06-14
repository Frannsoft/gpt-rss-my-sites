import fetch from 'node-fetch';

exports.handler = async function (event, context) {

    const rssUrls = [
        'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
        'https://www.nintendolife.com/feeds/latest',
        'https://hnrss.org/frontpage',
      ];
      const rssPromises = rssUrls.map((url) =>
        fetch(url)
      );
      const rssResponses = await Promise.all(rssPromises);
      const rssTexts = await Promise.all(
        rssResponses.map(async (response) => {
          return await response.text();
        })
      );

    return {
        statusCode: 200,
        body: JSON.stringify({data: rssTexts})
    };
};