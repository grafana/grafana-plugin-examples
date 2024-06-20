import React, { useState } from 'react';
import { useAsync } from 'react-use';

import { llms } from '@grafana/experimental';
import { Button, Input, Spinner } from '@grafana/ui';
import { SceneComponentProps, SceneObjectBase, SceneObjectState, SceneTimeRangeCompare, sceneGraph } from '@grafana/scenes';
import { CustomSceneObject } from 'pages/WithLLM/components/CustomSceneObject';

interface CustomObjectState extends SceneObjectState {
    llmResponse: string;
}

export class AdvancedLLMIntegration extends SceneObjectBase<CustomObjectState> {
    static Component = CustomObjectRenderer;

    constructor(state: CustomObjectState) {
        super({ ...state });
    }

    applyCommand = (command: string, customObject: CustomSceneObject, sceneTimeRangeCompare: SceneTimeRangeCompare) => {
        if (!isNaN(parseInt(command, 10))) {
            customObject.setState({ counter: parseInt(command, 10)});
        }

        switch (command) {
            case 'compare':
                sceneTimeRangeCompare.setState({ compareWith: '1w' });
                break;
            default:
                break;
        }
    }
}

function CustomObjectRenderer({ model }: SceneComponentProps<AdvancedLLMIntegration>) {
  const data = sceneGraph.getData(model).useState();



  // The current input value.
  const [input, setInput] = useState('');
  // The final message to send to the LLM, updated when the button is clicked.
  const [message, setMessage] = useState('');
  // The latest reply from the LLM.
  const [reply, setReply] = useState('');
  
    const SYSTEM_PROMPT = `
        Based on the user query provide a set response based on the following mappings: ${JSON.stringify(SYSTEM_PROMPT_ACTION_MAPPINGS)}

        If you are unable to determine the user's intent try your best to provide a response based on the context of the scene with a max of 100 characters. If you are still not confident or if the question is not related just say "I'm not sure how to assist with that". If the user is asking to compare and contrast data only return the word "compare".

        Only return a single word or number based on the user input, unless the command is "explain" in which case return a 250 character max response that also answers why it is important to the user using the following context of the embedded scene: ${JSON.stringify(data.data?.timeRange)} ${JSON.stringify(data.data?.series.slice(0, 10))}
        `

    const { loading, error, value } = useAsync(async () => {
        // Check if the LLM plugin is enabled and configured.
        // If not, we won't be able to make requests, so return early.
        const openAIHealthDetails = await llms.openai.enabled();
        const enabled = openAIHealthDetails;
        if (!enabled) {
            return { enabled };
        }
        if (message === '') {
            return { enabled };
        }

        // Make a single request to the LLM.
        const response = await llms.openai.chatCompletions({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message },
            ],
        });
        setReply(response.choices[0].message.content);
        model.setState({ llmResponse: response.choices[0].message.content });
        return { enabled, response };
    }, [message]);

  if (error) {
    // TODO: handle errors.
    return null;
  }

  return (
    <div>
      {value?.enabled ? (
        <>
          <Input
            style={{ padding: '10px' }}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Enter a message"
          />
          <br />
          <Button 
            type="submit" 
            onClick={() => {setMessage(input)}}
          >
            Submit Request
          </Button>
          <br />
          <div style={{ padding: '10px' }}>
            {loading ? <Spinner /> : reply}
          </div>
        </>
      ) : (
        <div>LLM plugin not enabled.</div>
      )}
    </div>
  );
}

// DEMO QUESTIONS
// Show me 20 servers
// Explain the data being displayed
// Compare and contrast this server's data with last week's data

// WARNING SUPER HACKY, DO NOT SHOW DURING DEMO :s
const SYSTEM_PROMPT_ACTION_MAPPINGS = {
    explain: 'the user wants the data being displayed explained, use any context provided, and return 250 character max response, do not make anything up',
    showNumberOfServers: 'return number of servers to show, only return the number the user suggested',
    compare: 'if user mentions compare and contrast data, return just the word "compare"',
}