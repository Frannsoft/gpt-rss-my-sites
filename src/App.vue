<template>
  <div>
    <h1>RSS Feeds</h1>
    <ul>
      <template v-for="(group, date) in groups" :key="date">
        <li class="group-heading">{{ formatDate(date) }}</li>
        <li v-for="item in group" :key="item.link" class="post">
          <div class="post-info">
            <a
              :href="
                item.source === 'Hacker News'
                  ? getHackerNewsLink(item.link)
                  : item.link
              "
              target="_blank"
            >
              <div class="item-top">
                <img :src="getIcon(item.source)" :alt="item.source" />
                <span>{{ item.title }}</span>
              </div>
            </a>
            <div class="post-text">
              <p
                class="post-description"
                v-if="item.source !== 'Hacker News'"
                v-html="sanitizeHtml(item.description)"
              ></p>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>
<script>
import DOMPurify from 'dompurify';

export default {
  data() {
    return {
      items: [],
      groups: {},
    };
  },
  async created() {
    const rssUrls = [
      'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
      'https://www.nintendolife.com/feeds/latest',
      'https://hnrss.org/frontpage',
    ];
    const rssPromises = rssUrls.map((url) =>
      fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
    );
    const rssResponses = await Promise.all(rssPromises);
    const rssTexts = await Promise.all(
      rssResponses.map((response) => response.text())
    );
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
  },
  methods: {
    getHackerNewsLink(link) {
      const idMatch = /item\?id=(\d+)/.exec(link);
      if (idMatch) {
        const id = idMatch[1];
        return `https://news.ycombinator.com/item?id=${id}`;
      } else {
        return link;
      }
    },
    sanitizeHtml(html) {
      return DOMPurify.sanitize(html);
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
        return 'https://logo.clearbit.com/nintendolife.com';
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
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item-top {
  display: flex;
  align-items: center;
}

.item-top img {
  height: 20px;
  width: 20px;
  padding-right: 1rem;
}

.post-info a {
  text-decoration: none;
}

.post {
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
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
