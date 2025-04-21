### 1. Request Count per Endpoint ###

SELECT url, COUNT(*) AS request_count
FROM logs
GROUP BY url
ORDER BY request_count DESC;

###  2. Response Time Trends ###

SELECT 
  DATE(created_at) AS date,
  url,
  AVG(time_taken) AS avg_response_time
FROM logs
WHERE time_taken IS NOT NULL
GROUP BY DATE(created_at), url
ORDER BY date;

### 3. Most Frequent Errors ###

SELECT status, COUNT(*) AS error_count
FROM logs
WHERE status >= 400
GROUP BY status
ORDER BY error_count DESC;

### 4. Real-Time Logs ###

SELECT * 
FROM logs
ORDER BY id DESC
LIMIT 100;

