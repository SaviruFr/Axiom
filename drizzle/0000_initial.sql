CREATE TABLE IF NOT EXISTS phishing_domains (
  domain text PRIMARY KEY,
  date_added timestamp DEFAULT NOW(),
  last_seen timestamp DEFAULT NOW()
);
