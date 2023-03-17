import * as React from "react";
import { useState } from "react";
import { getBackendSrv } from "@grafana/runtime";
import { testIds } from "../../components/testIds";
import { useAsync } from "react-use";
import {
  Badge,
  Button,
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
    backendSrv
      .get(
        `api/plugins/myorg-withbackend-app/resources/api${apiPath}?userID=${userID}`
      )
      .then((response) => {
        setApiResponse(response.results);
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
      <h3>API request on behalf of:</h3>
      <HorizontalGroup>
        <Label>Endpoint</Label>
        <Input
          value={apiPath}
          onChange={(e) => setApiPath(e.currentTarget.value)}
        />
        <Label>User ID</Label>
        <Input
          value={userID}
          onChange={(e) => setUserID(e.currentTarget.valueAsNumber)}
          type="number"
        />
        <Button onClick={apiRequest}>Request</Button>
      </HorizontalGroup>
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
