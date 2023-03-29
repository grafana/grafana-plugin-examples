import * as React from "react";
import { useState } from "react";
import { getBackendSrv } from "@grafana/runtime";
import { testIds } from "../../components/testIds";
import { useAsync } from "react-use";
import {
  Badge,
  Button,
  Checkbox,
  HorizontalGroup,
  Input,
  JSONFormatter,
  Label,
} from "@grafana/ui";

export const PageOne = () => {
  const backendSrv = getBackendSrv();
  const { error, loading, value } = useAsync(() => {
    return Promise.all([
      backendSrv.get(`api/plugins/myorg-withbackend-app/health`),
    ]);
  });
  const [userID, setUserID] = useState(1);
  const [apiPath, setApiPath] = useState("/search");
  const [apiResponse, setApiResponse] = useState({});
  const [apiToken, setApiToken] = useState({});
  const [onBehalfRequest, setOnBehalfRequest] = useState(false);

  if (loading) {
    return (
      <div data-testid={testIds.pageOne.container}>
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !value) {
    return (
      <div data-testid={testIds.pageOne.container}>
        <span>Error: {error?.message}</span>
      </div>
    );
  }

  const [health] = value;

  const apiRequest = () => {
    setApiResponse("Loading...");
    let params = {};
    if (onBehalfRequest) {
      params = { onBehalfRequest: true, userID: userID };
    }
    backendSrv
      .get(`api/plugins/myorg-withbackend-app/resources/api${apiPath}`, params)
      .then((response) => {
        setApiResponse(response.results);
        setApiToken(response.token);
      })
      .catch((error) => {
        setApiResponse({ error: error });
      });
  };

  return (
    <div data-testid={testIds.pageOne.container}>
      <HorizontalGroup>
        <h3>Plugin Health Check</h3>{" "}
        <span data-testid={testIds.pageOne.health}>
          {renderHealth(health?.message)}
        </span>
      </HorizontalGroup>
      <h3>API request:</h3>
      <HorizontalGroup>
        <Label>Endpoint</Label>
        <Input
          value={apiPath}
          onChange={(e) => setApiPath(e.currentTarget.value)}
        />
        <Label>On Behalf</Label>
        <Checkbox
          value={onBehalfRequest}
          onChange={(e) => setOnBehalfRequest(e.currentTarget.checked)}
        ></Checkbox>
        {onBehalfRequest && (
          <>
            <Label>User ID</Label>
            <Input
              value={userID}
              onChange={(e) => setUserID(e.currentTarget.valueAsNumber)}
              type="number"
            />
          </>
        )}
        <Button onClick={apiRequest}>Request</Button>
      </HorizontalGroup>
      <h3>Token used</h3>
      <JSONFormatter json={apiToken} />
      <h3>API Response</h3>
      <JSONFormatter json={apiResponse} />
    </div>
  );
};

function renderHealth(message: string | undefined) {
  switch (message) {
    case "ok":
      return <Badge color="green" text="OK" icon="heart" />;

    default:
      return <Badge color="red" text="BAD" icon="bug" />;
  }
}
