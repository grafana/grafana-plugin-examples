import React, { Suspense, useState } from 'react';
import { useAsync } from 'react-use';

import { llm, mcp } from '@grafana/llm';
import { PluginPage } from '@grafana/runtime';
import { Button, Icon, Input, LoadingPlaceholder, Spinner } from '@grafana/ui';
import { CallToolResultSchema, Tool } from '@modelcontextprotocol/sdk/types';
import { finalize } from 'rxjs';

function MCPTools({ tools }: { tools: Tool[] }) {
  return (
    <>
      <h3>Available MCP Tools</h3>
      <ul>
        {tools.map((tool, i) => (
          <li key={i}>{tool.name}</li>
        ))}
      </ul>
    </>
  );
}

interface RenderedToolCall {
  name: string;
  arguments: string;
  running: boolean;
  error?: string;
}

function ToolCalls({ toolCalls }: { toolCalls: Map<string, RenderedToolCall> }) {
  return (
    <div>
      <h3>Tool Calls</h3>
      {toolCalls.size === 0 && <div>No tool calls yet</div>}
      <ul>
        {Array.from(toolCalls.values()).map((toolCall, i) => (
          <li key={i}>
            <div>
              {toolCall.name}
              {' '}
              (<code>{toolCall.arguments}</code>)
              {' '}
              <Icon name={toolCall.running ? 'spinner' : 'check'} size='sm' />
              {toolCall.error && <code>{toolCall.error}</code>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LLMUsage({ tools }: { tools: Tool[] }) {
  const client = mcp.useMCPClient();

  // The current input value.
  const [input, setInput] = useState('');
  // The final message to send to the LLM, updated when the button is clicked.
  const [message, setMessage] = useState('');
  // The latest reply from the LLM.
  const [reply, setReply] = useState('');

  const [toolCalls, setToolCalls] = useState<Map<string, RenderedToolCall>>(new Map());

  const [useStream, setUseStream] = useState(false);

  const { loading, error } = useAsync(async () => {

    if (message === '') {
      return;
    }

    if (!useStream) {
      setToolCalls(new Map());
      const messages: llm.Message[] = [
        { role: 'system', content: 'You are a cynical assistant.' },
        { role: 'user', content: message },
      ];
      // Make a single request to the LLM.
      let response = await llm.chatCompletions({
        model: 'gpt-3.5-turbo',
        messages,
        tools: mcp.convertToolsToOpenAI(tools),
      });

      // Handle any function calls, looping until there are no more.
      let functionCalls = response.choices[0].message.tool_calls?.filter(tc => tc.type === 'function') ?? [];
      while (functionCalls.length > 0) {
        // We need to include the 'tool_call' request in future responses.
        messages.push(response.choices[0].message);

        // Submit all tool requests.
        await Promise.all(functionCalls.map(async (fc) => {
          // Update the tool call state for rendering.
          setToolCalls(new Map(toolCalls.set(fc.id, { name: fc.function.name, arguments: fc.function.arguments, running: true })));
          const { function: f, id } = fc;
          try {
            // OpenAI sends arguments as a JSON string, so we need to parse it.
            const args = JSON.parse(f.arguments);
            const response = await client.callTool({ name: f.name, arguments: args });
            const toolResult = CallToolResultSchema.parse(response);
            // Just handle text results for now.
            const textContent = toolResult.content.filter(c => c.type === 'text').map(c => c.text).join('');
            // Add the result to the message, with the correct role and id.
            messages.push({ role: 'tool', tool_call_id: id, content: textContent });
            // Update the tool call state for rendering.
            setToolCalls(new Map(toolCalls.set(id, { name: f.name, arguments: f.arguments, running: false })));
          } catch (e: any) {
            const error = e.message ?? e.toString();
            messages.push({ role: 'tool', tool_call_id: id, content: error });
            // Update the tool call state for rendering.
            setToolCalls(new Map(toolCalls.set(id, { name: f.name, arguments: f.arguments, running: false, error })));
          }
        }));
        // `messages` now contains all tool call request and responses so far.
        // Send it back to the LLM to get its response given those tool calls.
        response = await llm.chatCompletions({
          model: 'gpt-3.5-turbo',
          messages,
          tools: mcp.convertToolsToOpenAI(tools),
        });
        functionCalls = response.choices[0].message.tool_calls?.filter(tc => tc.type === 'function') ?? [];
      }
      // No more function calls, so we can just use the final response.
      setReply(response.choices[0].message.content);

    } else {

      // TODO: deal with the streaming case...
      setToolCalls(new Map());

      // Stream the completions. Each element is the next stream chunk.
      const stream = llm.streamChatCompletions({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a cynical assistant.' },
          { role: 'user', content: message },
        ],
      }).pipe(
        // Accumulate the stream content into a stream of strings, where each
        // element contains the accumulated message so far.
        llm.accumulateContent(),
        // The stream is just a regular Observable, so we can use standard rxjs
        // functionality to update state, e.g. recording when the stream
        // has completed.
        // The operator decision tree on the rxjs website is a useful resource:
        // https://rxjs.dev/operator-decision-tree.
        finalize(() => {
          console.log('stream finalized');
        })
      );
      // Subscribe to the stream and update the state for each returned value.
      stream.subscribe(setReply);
    }
  }, [message]);

  if (error) {
    // TODO: handle errors.
    return null;
  }

  return (
    <div>
      <Input
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder="Enter a message"
      />
      <br />
      <Button type="submit" onClick={() => { setMessage(input); setUseStream(true); }}>Submit Stream</Button>
      <Button type="submit" onClick={() => { setMessage(input); setUseStream(false); }}>Submit Request</Button>
      <br />
      <br />
      <ToolCalls toolCalls={toolCalls} />
      <br />
      <div>{loading ? <Spinner /> : reply}</div>
      <br />
    </div>
  )
}

function Container() {
  const client = mcp.useMCPClient();
  const { loading, error, value: tools } = useAsync(() => client.listTools());

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  const t = tools?.tools ?? [];
  return (
    <div>
      <MCPTools tools={t} />
      <br />
      <LLMUsage tools={t} />
    </div>
  )
}

export function PageOne() {
  const { loading, error, value: enabled } = useAsync(async () => {
    // Check if the LLM plugin is enabled and configured.
    // If not, we won't be able to make requests, so return early.
    return llm.enabled();
  });
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!enabled) {
    return <div>LLM plugin not enabled.</div>;
  }
  return (
    <PluginPage>
      <Suspense fallback={<LoadingPlaceholder text="Loading MCP..." />}>
        <mcp.MCPClientProvider
          appName="Grafana App With Model Context Protocol"
          appVersion="1.0.0"
        >
          <Container />
        </mcp.MCPClientProvider>
      </Suspense>

    </PluginPage>
  );
}
