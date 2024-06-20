import { CustomVariable, EmbeddedScene, PanelBuilders, SceneControlsSpacer, SceneFlexItem, SceneFlexLayout, SceneQueryRunner, SceneReactObject, SceneRefreshPicker, SceneTimePicker, SceneTimeRange, SceneTimeRangeCompare, SceneVariableSet } from "@grafana/scenes"
import { BasicLLMIntegration } from "./components/BasicLLMIntegration"
import { CustomSceneObject } from "pages/Home/CustomSceneObject";
import { DATASOURCE_REF } from "../../constants";
import { AdvancedLLMIntegration } from "./components/AdvancedLLMIntegration";

export const getBasicLLMIntegrationScene = () =>
  new EmbeddedScene({
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        basicLLMIntegration()
      ],
    }),
  });

// QUESTIONS TO ASK
// If you had a to guess a number that defines the meaning of life what it would be and why?
// Define observability and monitoring in your own words
const basicLLMIntegration = () => {
    return new SceneFlexLayout({
        direction: 'column',
        children: [
            new SceneFlexItem({
                height: 300,
                body: new SceneReactObject({
                    component: BasicLLMIntegration
                }),
            })
            // TODO: Maybe also include vector DB example as well?
        ],
    })
}

export const getAdvancedLLMIntegrationScene = () => {
  const sceneTimeRangeCompare = new SceneTimeRangeCompare({compareWith: undefined});
  
  return new EmbeddedScene({
    body: new SceneFlexLayout({
        direction: 'column',
        children: [
            advancedLLMIntegration(sceneTimeRangeCompare)
        ],
    }),
    controls: [
    new SceneControlsSpacer(),
    sceneTimeRangeCompare,
    new SceneTimePicker({ isOnCanvas: true }),
    new SceneRefreshPicker({
      intervals: ['5s', '1m', '1h'],
      isOnCanvas: true,
    }),
   ]
})}

const advancedLLMIntegration = (sceneTimeRangeCompare: SceneTimeRangeCompare) => {
    const customObject = new CustomSceneObject({ counter: 5 });

  // Query runner definition, using Grafana built-in TestData datasource
  const queryRunner = new SceneQueryRunner({
    datasource: DATASOURCE_REF,
    queries: [
      {
        refId: 'A',
        datasource: DATASOURCE_REF,
        scenarioId: 'random_walk',
        seriesCount: 5,
        // Query is using variable value
        alias: '__server_names',
        min: 30,
        max: 60,
      },
    ],
    maxDataPoints: 100,
  });

  // Query runner activation handler that will update query runner state when custom object state changes
  queryRunner.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
      queryRunner.setState({
        queries: [
          {
            ...queryRunner.state.queries[0],
            seriesCount: newState.counter,
          },
        ],
      });
      queryRunner.runQueries();
    });

    return () => {
      sub.unsubscribe();
    };
  });
    
    const advancedLLMIntegration = new AdvancedLLMIntegration({
        llmResponse: ''
    })

    advancedLLMIntegration.subscribeToState((newState, oldState) => { 
        if (newState.llmResponse !== oldState.llmResponse && newState.llmResponse !== '') {
            advancedLLMIntegration.applyCommand(newState.llmResponse, customObject, sceneTimeRangeCompare)
        }
    })

  return new SceneFlexLayout({
    $data: queryRunner,
    direction: 'column',
    children: [
      new SceneFlexItem({
        maxWidth: 500,
        body: advancedLLMIntegration,
      }),
      new SceneFlexItem({ body: getBasicScene(false, '__server_names', customObject)}),
        ],
    })
}

function getBasicScene(templatised = true, seriesToShow = '__server_names', customObject: CustomSceneObject) {
    const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  // Variable definition, using Grafana built-in TestData datasource
  const customVariable = new CustomVariable({
    name: 'seriesToShow',
    label: 'Series to show',
    value: '__server_names',
    query: 'Server Names : __server_names, House locations : __house_locations',
  });
    

  return new EmbeddedScene({
    $timeRange: timeRange,
    $variables: new SceneVariableSet({ variables: templatised ? [customVariable] : [] }),
    body: new SceneFlexLayout({
      children: [
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            // Title is using variable value
            .setTitle(templatised ? '${seriesToShow}' : seriesToShow)
            .setOverrides((b) =>
              b.matchComparisonQuery('A').overrideColor({
                mode: 'fixed',
                fixedColor: 'red',
              }))
            .build(),
        }),
      ],
    }),
    controls: [
      customObject,
    ],
  });
}
