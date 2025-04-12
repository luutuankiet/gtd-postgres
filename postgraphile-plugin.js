const { makeExtendSchemaPlugin, gql } = require("graphile-utils");

const SearchQuestionsPlugin = makeExtendSchemaPlugin(build => ({
  typeDefs: gql`
    extend type Query {
      search_questions(term: String!): [SearchResult!]!
    }

    type SearchResult {
      todo_title: String
      todo_content: String
      rank: Float
    }
  `,
  resolvers: {
    Query: {
      search_questions: async (_query, args, context, _resolveInfo) => {
        const { term } = args;
        const result = await context.pgClient.query(`
          SELECT todo_title, todo_content,
                 ts_rank(search, websearch_to_tsquery('english', $1)) + 
                 ts_rank(search, websearch_to_tsquery('simple', $1)) as rank
          FROM prod.tmp_ts__fact_todos 
          WHERE search @@ websearch_to_tsquery('english', $1)
             OR search @@ websearch_to_tsquery('simple', $1)
          ORDER BY rank DESC;
        `, [term]);
        return result.rows;
      }
    }
  }
}));

module.exports = SearchQuestionsPlugin;