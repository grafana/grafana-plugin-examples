import React, { useState } from 'react';
import { useAsync } from 'react-use';

import { llms } from '@grafana/experimental';
import { Button, Input, Spinner } from '@grafana/ui';
import { finalize } from 'rxjs';

export function BasicLLMIntegration() {
  // The current input value.
  const [input, setInput] = useState('');
  // The final message to send to the LLM, updated when the button is clicked.
  const [message, setMessage] = useState('');
  // The latest reply from the LLM.
  const [reply, setReply] = useState('');

  const [useStream, setUseStream] = useState(false);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(true);

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

    setStarted(true);
    setFinished(false);
    if (!useStream) {
      // Make a single request to the LLM.
      const response = await llms.openai.chatCompletions({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a cynical assistant.' },
          { role: 'user', content: message },
        ],
      });
      setReply(response.choices[0].message.content);
      setStarted(false);
      setFinished(true);
      return { enabled, response };
    } else {
      // Stream the completions. Each element is the next stream chunk.
      const stream = llms.openai.streamChatCompletions({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a cynical assistant.' },
          { role: 'user', content: message },
        ],
      }).pipe(
        // Accumulate the stream content into a stream of strings, where each
        // element contains the accumulated message so far.
        llms.openai.accumulateContent(),
        // The stream is just a regular Observable, so we can use standard rxjs
        // functionality to update state, e.g. recording when the stream
        // has completed.
        finalize(() => {
          setStarted(false);
          setFinished(true);
        })
      );
      // Subscribe to the stream and update the state for each returned value.
      return {
        enabled,
        stream: stream.subscribe(setReply),
      };
    }
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
            style={{ marginRight: '10px'}}
            type="submit" 
            onClick={() => {setMessage(input); setUseStream(true);}}
          >
            Submit Stream
          </Button>
          <Button 
            type="submit" 
            onClick={() => {setMessage(input); setUseStream(false);}}
          >
            Submit Request
          </Button>
          <br />
          <div style={{ padding: '10px' }}>
            {loading ? <Spinner /> : reply}
          </div>
          <div style={{ padding: '10px' }}>
            {started ? "Response is started" : "Response is not started"}
          </div>
          <div style={{ padding: '10px' }}>
            {finished ? "Response is finished" : "Response is not finished"}
          </div>
        </>
      ) : (
        <div>LLM plugin not enabled.</div>
      )}
    </div>
  );
}
