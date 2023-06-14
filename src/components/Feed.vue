<template>
  <div>
    <h1>My News</h1>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Fetching your news...</p>
    </div>
    <ul v-if="!loading">
      <template v-for="(group, date) in groups" :key="date">
        <li class="group-heading" @click="toggleGroup(date)">{{ formatDate(date) }}</li>
        <div class="group-container" :class="{ 'hidden': this.groupHidden[date] }">
          <li v-for="item in group" :key="item.link" class="post">
            <div class="post-info">
              <a :href="
                item.source === 'Hacker News'
                  ? getHackerNewsCommentsUrl(item.description)
                  : item.link
              " target="_blank">
                <div class="item-top">
                  <img :src="getIcon(item.source)" :alt="item.source" />
                  <span>{{ item.title }}</span>
                </div>
              </a>
              <div class="post-text">
                <p class="post-description" v-if="item.source !== 'Hacker News'" v-html="sanitizeHtml(item.description)">
                </p>
              </div>
            </div>
          </li>
        </div>
      </template>
    </ul>
  </div>
</template>
<script>
import DOMPurify from 'dompurify';
import { getHackerNewsLink } from '../utils/getHackerNewsLink';

export default {
  data() {
    return {
      items: [],
      groups: {},
      loading: true,
      groupHidden: {}
    };
  },
  async created() {
    // const rssUrls = [
    //   'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    //   'https://www.nintendolife.com/feeds/latest',
    //   'https://hnrss.org/frontpage',
    // ];
    // const rssPromises = rssUrls.map((url) =>
    //   //fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
    //   fetch(`.netlify/functions/fetch-data.js`, {
    //     method: 'GET'
    //   })
    // );
    // const rssResponses = await Promise.all(rssPromises);
    // const rssTexts = await Promise.all(
    //   rssResponses.map(async (response) => {
    //     const te = await response.text();
    //     console.log(te);
    //     return te;
    //   })
    // );
    const rssTexts = await fetch(`.netlify/functions/fetch-rss`, {method: 'GET'});
    console.log(await rssTexts.text());
    const rssFeeds = rssTexts.map((text, index) => ({
      source: this.getSourceFromUrl(rssUrls[index]),
      feed: new window.DOMParser().parseFromString(text, 'text/xml'),
    }));
    
    const items = rssFeeds.flatMap(({ source, feed }) =>
      Array.from(feed.querySelectorAll('item')).map((item) => ({
        source,
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        description: item.querySelector('description').textContent,
        pubDate: item.querySelector('pubDate').textContent,
      }))
    );
    
    const sortedItems = items.sort(
      (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
    );
    const groups = {};
    for (const item of sortedItems) {
      const date = new Date(item.pubDate).toDateString();
      if (date in groups) {
        groups[date].push(item);
      } else {
        groups[date] = [item];
      }
    }
    this.groups = groups;
    this.groupHidden = Object.keys(groups).reduce((obj, date) => {
      obj[date] = false;
      return obj;
    }, {});

    this.loading = false;
  },
  methods: {
    toggleGroup(date) {
      this.groupHidden[date] = !this.groupHidden[date];
      const groupItems = this.groups[date];
      for (const item of groupItems) {
        item.hidden = this.groupHidden[date];
      }
    },
    getHackerNewsLinkService(link) {
      return getHackerNewsLink(link);
    },
    getHackerNewsCommentsUrl(str) {
      const regex = /<p>Comments URL: <a href="(.*)">/;
      const match = str.match(regex);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    },
    sanitizeHtml(html) {
      const sanitizedHtml = DOMPurify.sanitize(html);

      const maxLength = 50;
      const words = sanitizedHtml.split(' ');
      if (words.length > maxLength) {
        const truncatedWords = words.slice(0, maxLength).join(' ');
        return truncatedWords + '...';
      }
      return sanitizedHtml;
    },
    getSourceFromUrl(url) {
      const host = new URL(url).hostname;
      if (host.includes('dj.com')) {
        return 'Wall Street Journal';
      } else if (host.includes('nintendolife.com')) {
        return 'Nintendo Life';
      } else if (host.includes('hnrss.org')) {
        return 'Hacker News';
      } else {
        return 'Unknown';
      }
    },
    getIcon(source) {
      if (source === 'Wall Street Journal') {
        return 'https://www.wsj.com/favicon.ico';
      } else if (source === 'Nintendo Life') {
        return 'https://images.nintendolife.com/site/favicon/32x32.png';
      } else if (source === 'Hacker News') {
        return 'https://news.ycombinator.com/favicon.ico';
      } else {
        return '';
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      return date.toLocaleTimeString('en-US', options);
    },
  },
};
</script>
<style>
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--vt-c-black);
  font-style: italic;
  z-index: 999;
}

.spinner {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.group-heading {
  font-size: large;
  cursor: pointer;
  margin: 2rem 0 0 0;
  font-weight: bold;
}

.group-heading:hover {
  text-decoration: underline;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 768px) {
  ul {
    max-width: 100%;
  }
}


.item-top {
  display: flex;
  align-items: center;
}

@media only screen and (max-width: 600px) {
  .item-top {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
  }

  .item-top img {
    margin-right: 0;
    margin-left: 1rem;
  }

  .item-top span {
    margin-right: 1rem;
    font-size: smaller;
  }
}


.item-top img {
  height: 20px;
  width: 20px;
  margin-right: 1rem;
}

.post-info a {
  text-decoration: none;
}

.post {
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.container {
  transition: all 0.5s ease-in-out;
  opacity: 1;
}

.group-container.hidden {
  transform: translateY(-50px);
  opacity: 0;
  display: none;
}

.post-info {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 10px;
  font-size: 1.4em;
  font-family: sans-serif;
}

.post-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 0.75rem;
}

.post-text h2 {
  margin: 0;
  font-size: 1.4em;
  font-family: sans-serif;
}

.post-description {
  margin: 0;
  font-size: 1.2em;
}

.post-date {
  margin: 0;
  font-size: 0.75rem;
  font-style: italic;
  flex-grow: 1;
}

.post-list li:hover {
  background-color: #f7fafc;
}
</style>
