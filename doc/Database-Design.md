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
* Query 1:  Find the most popular event category based on event count, only returns categories with higher than average distinct user contributions
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