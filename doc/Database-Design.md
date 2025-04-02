# Database Implementation
## Logical Database Schema: 
```mysql
CREATE TABLE Users (
    user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL );

CREATE TABLE Sources (
    source_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    source_name VARCHAR(50),
    author VARCHAR(50),
    source_year INT );

CREATE TABLE Events (
    event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_name VARCHAR(50),
    event_date DATE,
    event_description VARCHAR(255),
    source_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES Sources(source_id) ON DELETE SET NULL );

CREATE TABLE IF NOT EXISTS Categories (
    category_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    cat_description VARCHAR(255) );

CREATE TABLE categoryHierarchy (
   parent_category_id INT NOT NULL,
   category_descendent INT NOT NULL,
   PRIMARY KEY (parent_category_id, category_descendent),
   FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
   FOREIGN KEY (category_descendent) REFERENCES Categories(category_id) ON DELETE CASCADE );

CREATE TABLE UserCategoryPreferences (
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE );

CREATE TABLE EventCategory (
    event_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (event_id, category_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE );
```

## Database Connection and Row Counts
![Database Connection](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Database_Connection.png)
![Table Row Counts](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Database_Table_RowCount.png)

# Queries and Indexing
## Queries
#### Query 1:  Find the most popular event category based on event count, only returns categories with higher than average distinct user contributions
```mysql
SELECT ranked.category_name, ranked.event_count
FROM (
	SELECT c.category_name, COUNT(*) AS event_count,
       	COUNT(DISTINCT e.user_id) AS distinct_users,
       	RANK() OVER (PARTITION BY c.category_name ORDER BY COUNT(*) DESC) AS ranking
	FROM Events e
	JOIN EventCategory ec ON e.event_id = ec.event_id
	JOIN Categories c ON ec.category_id = c.category_id
	JOIN Sources s ON e.source_id = s.source_id
	GROUP BY c.category_name
) AS ranked
WHERE ranked.ranking = 1
AND ranked.distinct_users > (
	SELECT AVG(distinct_user_count)
	FROM (
    	SELECT COUNT(DISTINCT e.user_id) AS distinct_user_count
    	FROM Events e
    	JOIN EventCategory ec ON e.event_id = ec.event_id
    	GROUP BY ec.category_id
	) AS category_users
)
ORDER BY ranked.event_count DESC, ranked.category_name
LIMIT 15;
```
![Table Row Counts](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Query_1.png)

#### Query 2: Finds the top events that are interesting to the most users based on their category preferences
```mysql
SELECT
   e.event_name,
   e.event_date,
   COUNT(DISTINCT ucp.user_id) AS interested_user_count
FROM
   Events e
JOIN EventCategory ec ON e.event_id = ec.event_id
JOIN UserCategoryPreferences ucp ON ec.category_id = ucp.category_id
GROUP BY
   e.event_id, e.event_name, e.event_date
HAVING COUNT(DISTINCT ucp.user_id) > 1
ORDER BY interested_user_count DESC
LIMIT 15;
```
![Table Row Counts](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Query_2.png)

#### Query 3: Users who has contributed, but none of the contribution are in the top category, i.e. user who contributed to less popular categories
```mysql
SELECT
   u.user_id,
   u.username
FROM
   Users u
WHERE
   EXISTS (
       SELECT 1
       FROM Events e
       WHERE e.user_id = u.user_id
   )
   AND NOT EXISTS (
       SELECT 1
       FROM Events e
       JOIN EventCategory ec ON e.event_id = ec.event_id
       WHERE e.user_id = u.user_id
         AND ec.category_id = (
             SELECT category_id
             FROM EventCategory
             GROUP BY category_id
             ORDER BY COUNT(*) DESC
             LIMIT 1
         )
   )
LIMIT 15;
```

![Table Row Counts](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Query_3.png)

#### Query 4: Find top 15 most active users based on event participation and category interests
```mysql
WITH UserActivity AS (
SELECT
      u.user_id,
      u.username,
      COUNT(DISTINCT e.event_id) AS total_events_created,
      COUNT(DISTINCT ucp.category_id) AS total_categories_followed
  FROM Users u
  LEFT JOIN Events e ON u.user_id = e.user_id
  LEFT JOIN UserCategoryPreferences ucp ON u.user_id = ucp.user_id
  GROUP BY u.user_id, u.username
)
SELECT
  user_id,
  username,
  total_events_created,
  total_categories_followed,
  RANK() OVER (ORDER BY (total_events_created + total_categories_followed) DESC) AS user_rank
FROM UserActivity
LIMIT 15;
```

![Table Row Counts](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Query_4.png)

#### Query 5: Find Categories with No Events Assigned 
```mysql
SELECT
  c.category_id, c.category_name
FROM
   Categories c
LEFT JOIN EventCategory ec ON c.category_id = ec.category_id
WHERE ec.event_id IS NULL
LIMIT 15;
```

![Table Row Counts](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Query_5.png)

The result of this query was only 4 rows long.

## Indexing
#### Query 1: Find the most popular event category based on event count, only returns categories with higher than average distinct user contributions

Before Indexing:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q1_i0.png)

idx_events_user_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q1_i1.png)

idx_eventcategory_category_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q1_i2.png)

idx_categories_category_name:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q1_i3.png)

|   Index     |        Initial Cost    |       Final Cost       |   Comments |
| ----------- | ---------------------- | ---------------------- | ----------- |
| idx_events_user_id      |        139,672        |       139,672          |   No significant impact since most joins already efficient          |
| idx_eventcategory_category_id   |           139,672         |        137,465          |    Saves cost=2167 in second GROUP BY         |
| idx_categories_category_name     |         139,672   |        139,672         |     No significant impact since most joins already efficient        |

The final index design:
idx_eventcategory_category_id
The index on EventCategory(category_id) was used to save a cost of about 2167 in the GROUP BY clause, however it is not entirely necessary since our dataset is highly scattered, most users create only a few events, and category usage is low and varied. 

#### Query 2: Select the most categories that are in most user’s default preference

Before Indexing:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q2_i0.png)

idx_eventcategory_event_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q2_i1.png)

idx_eventcategory_category_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q2_i2.png)

idx_ucp_category_id_user_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q2_i3.png)

|   Index     |        Initial Cost    |       Final Cost       |   Comments |
| ----------- | ---------------------- | ---------------------- | ----------- |
| idx_eventcategory_event_id      |        177125        |       177002          |    No significant impact since most joins already efficient         |
| idx_eventcategory_category_id   |           177125         |        175841          |    No significant impact since most joins already efficient         |
| idx_ucp_category_id_user_id     |         177125   |        176818         |      This is actually a FK which makes it already optimized       |

The final index design:
No new indices were added since the FK already makes the query efficient. Because of the sparsity of the data, indexing had limited impact, as the query still executed a full scan over indexes due to low overlaps

#### Query 3: Users who has contributed, but none of the contribution are in the top category

Before Indexing:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q3_i0.png)

idx_events_user_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q3_i1.png)

idx_eventcategory_event_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q3_i2.png)

idx_eventcategory_category_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q3_i3.png)

|   Index     |        Initial Cost    |       Final Cost       |   Comments |
| ----------- | ---------------------- | ---------------------- | ----------- |
| idx_events_user_id      |        45,797       |       45,799          |     No significant impact since most joins already efficient        |
| idx_eventcategory_event_id   |           45,797         |        45,799          |     No significant impact since most joins already efficient        |
| idx_eventcategory_category_id    |         45,797   |        1,630,000        |    Caused cost to balloon – maybe due to forcing index that slows down popular-category subquery         |

The final index design:
No new indices were added since the FK already makes the query efficient. The indexing did not help improve the cost since the FK was already optimal, thus making the join process the most efficient already. 

#### Query 4: Find top 15 most active users based on event participation and category interests

Before Indexing:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q4_i0.png)

idx_usercategorypreferences_user_id_category_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q4_i0.png)

idx_events_user_id_event_id:
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q4_i0.png)

Both Best Indexes ('user_id, category_id' & 'user_id, event_id'):
![q1i0](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/q4_i0.png)

|   Index     |        Initial Cost    |       Final Cost       |   Comments |
| ----------- | ---------------------- | ---------------------- | ----------- |
| idx_usercategorypreferences_user_id_category_id    |        22995       |       22995          |    Kept - Optimizes joins with UserCategoryPreferences         |
| idx_events_user_id_event_id   |           139,672         |        21983         |     Kept - Optimizes joins with Events        |
| Both Best Indexes ('user_id, category_id' & 'user_id, event_id')    |         22995   |        21983         |     Best Choice - Used both indexes together for overall efficiency        |

The final index design:
Both Best Indexes ('user_id, category_id' & 'user_id, event_id')

The query performance improved because indexes reduced the cost of JOINs by allowing MySQL to quickly look up matching rows instead of scanning entire tables. Additionally, the index on Events(user_id, event_id) made counting distinct events more efficient. However, sorting (ORDER BY) remained a bottleneck, limiting further gains. The sorting cost was (cost=37593..37593) for all of the tries so that did not improve, I saw a bit of improvement only in the group aggregate one.