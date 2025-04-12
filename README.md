# high level overview
- use text search from postgres : tsvector, tsquery variants : websearch_to_tsquery
- create API expressJS





# setup the index to auto refresh on new records

```sql
--add the search index
alter table prod.tmp_ts__fact_todos 
add search tsvector
generated always as (
  setweight(to_tsvector('english',todo_title), 'A') || ' ' ||
  setweight(to_tsvector('english',todo_content), 'B') :: tsvector
) stored;




-- add the index
create index idx_search on prod.tmp_ts__fact_todos  using GIN(search);



-- turning it into a function; for internal cmd use cause this be hardcoded on the server side
create or replace function search_questions(term text) 
returns table(
  todo_title text,
  todo_content text,
  rank real
)
as
$$

select todo_title, todo_content,
  ts_rank(search, websearch_to_tsquery('english',term)) + 
  ts_rank(search, websearch_to_tsquery('simple',term)) as rank
from prod.tmp_ts__fact_todos 
where search @@ websearch_to_tsquery('english',term)
or search @@ websearch_to_tsquery('simple',term)
order by rank desc;

$$ language SQL;





```


### 1. **Create a Simple REST API with Express**

You can use Node.js and Express to create a simple REST API that calls your PostgreSQL function. This method is straightforward and avoids the complexity of GraphQL and PostGraphile.

#### a. **Set Up Your Node.js Environment**

1. **Install Node.js** if you haven't already.

2. **Create a New Directory for Your Project**:

    ```bash
    mkdir my-api
    cd my-api
    ```

3. **Initialize a New Node.js Project**:

    ```bash
    npm init -y
    ```

4. **Install Required Packages**:

    ```bash
    npm install express pg
    ```

#### b. **Create Your Express Server**

Create a file named `index.js` in your project directory

#### c. **Run Your Express Server**

In the terminal, start your server:

```bash
node index.js
```

### 2. **Update Your Client-Side Code**

Modify your client-side code to make requests to the new REST API endpoint.