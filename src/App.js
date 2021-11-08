import './App.css';
import { makeDefaultArg, getDefaultScalarArgValue } from "./CustomArgs";
import GraphiQL from "graphiql";
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import GraphiQLExplorer from "graphiql-explorer";
import { buildClientSchema, getIntrospectionQuery } from "graphql";
import { useState } from 'react';


function App() {
  let _graphiql = GraphiQL;
  const [url, setUrl] = useState(localStorage.getItem('endpoint_url') || "")
  const [urlDisplay, setUrlDisplay] = useState(url)
  const [inpstyle, setInpstyle] = useState({ border: 'none' })
  const [fetcher, setFetcher] = useState(() => createGraphiQLFetcher({ url }))
  const [schema, setSchema] = useState("")
  const [query, setQuery] = useState("")
  const [explorer, setExplorer] = useState(true)

  function fetch_schema() {
    if (!url) return
    fetch(
      url,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: getIntrospectionQuery() })
      }
    ).then(function (response) {
      response.text().then(text => {
        setSchema(buildClientSchema(JSON.parse(text).data))
        setFetcher(() => createGraphiQLFetcher({ url }))
        setInpstyle({ border: 'none' })
        localStorage.setItem('endpoint_url', url)
      }).catch(error => {
        setInpstyle({ border: '1px solid red' })
      })

    }).catch(error => {
      setInpstyle({ border: '1px solid red' })
    })
  }

  const _handleEditQuery = (query) => setQuery(query);
  const _handleToggleExplorer = () => setExplorer(!explorer);


  return (
    <div className="App">
      <div className="graphiql-container">
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={_handleEditQuery}
          onRunOperation={operationName =>
            _graphiql.handleRunQuery(operationName)
          }
          explorerIsOpen={explorer}
          onToggleExplorer={_handleToggleExplorer}
          getDefaultScalarArgValue={getDefaultScalarArgValue}
          makeDefaultArg={makeDefaultArg}
        />
        <GraphiQL
          ref={ref => (_graphiql = ref)}
          fetcher={fetcher}
          schema={schema}
          query={query}
          headerEditorEnabled={true}
          // validationRules
          onEditQuery={_handleEditQuery}
        >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => _graphiql.handlePrettifyQuery()}
              label="Prettify"
              title="Prettify Query"
            />
            <GraphiQL.Button
              onClick={() => _graphiql.handleMergeQuery()}
              label="Merge"
              title="Merge Query"
            />
            <GraphiQL.Button
              onClick={() => _graphiql.handleCopyQuery()}
              label="Copy"
              title="Copy Query"
            />
            <GraphiQL.Button
              onClick={() => _graphiql.handleToggleHistory()}
              label="History"
              title="Show History"
            />
            <GraphiQL.Button
              onClick={_handleToggleExplorer}
              label="Explorer"
              title="Toggle Explorer"
            />
            <GraphiQL.Button
              onClick={() => setQuery("")}
              label="Clear"
              title="Clear Query"
            />
            <input type='text' placeholder="Endpoint (Press Enter)"
              value={urlDisplay} style={inpstyle}
              onChange={(e) => setUrlDisplay(() => e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setUrl(e.target.value)
                  fetch_schema()
                }
              }} />
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    </div>
  );
}

export default App;
