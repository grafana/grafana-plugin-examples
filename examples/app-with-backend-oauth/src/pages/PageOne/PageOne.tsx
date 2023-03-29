import * as React from "react";
import { useState } from "react";
import { getBackendSrv } from "@grafana/runtime";
import { testIds } from "../../components/testIds";
import { useAsync } from "react-use";
import {
  Badge,
  Button,
  Checkbox,
  VerticalGroup,
  HorizontalGroup,
  Input,
  JSONFormatter,
  Label,
  Select,
  useStyles2,
  TextArea
} from "@grafana/ui";
import { GrafanaTheme2 } from "@grafana/data";
import { css } from "@emotion/css";

export const PageOne = () => {
  const s = useStyles2(getStyles);

  const backendSrv = getBackendSrv();
  const { error, loading, value } = useAsync(() => {
    return Promise.all([
      backendSrv.get(`api/plugins/myorg-withbackend-app/health`)
    ]);
  });
  const [userID, setUserID] = useState(1);
  const [apiPath, setApiPath] = useState("/dashboards/db");
  const [apiResponse, setApiResponse] = useState({});
  const [apiToken, setApiToken] = useState({});
  const [method, setMethod] = useState("POST");
  const [body, setBody] = useState("");
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
    let parsedBody = JSON.parse(body);
    params = { ...params, method: method, body: JSON.stringify(parsedBody) };
    if (onBehalfRequest) {
      params = { ...params, onBehalfRequest: true, userID: userID };
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
      <VerticalGroup>
        <HorizontalGroup>
          <h3>Plugin Health Check</h3>{" "}
          <span data-testid={testIds.pageOne.health}>
            {renderHealth(health?.message)}
          </span>
        </HorizontalGroup>
        <h3>API request:</h3>
        <div className={s.input}>
          <HorizontalGroup>
            <Select
              value={method}
              options={[
                { label: "GET", value: "GET" },
                { label: "POST", value: "POST" }
              ]}
              onChange={(e) => setMethod(e.value ? e.value : "POST")}
            />
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
            {onBehalfRequest && <Label>User ID</Label>}
            {onBehalfRequest && (
              <Input
                value={userID}
                onChange={(e) => setUserID(e.currentTarget.valueAsNumber)}
                type="number"
              />
            )}
          </HorizontalGroup>
          <div className={s.inputbutton}>
            <Button onClick={apiRequest}>Request</Button>
          </div>
        </div>
        {method === "POST" && (
          <TextArea
            className={s.body}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            type="text"
          />
        )}
        <div className={s.section}>
          <h3>Token used</h3>
          <JSONFormatter json={apiToken} />
        </div>
        <div className={s.section}>
          <h3>API Response</h3>
          <JSONFormatter json={apiResponse} />
        </div>
      </VerticalGroup>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  inputbutton: css`
    margin-left: ${theme.spacing(1)};
  `,
  input: css`
    display: flex;
    justify-content: space-between;
    width: 100%;
  `,
  body: css`
    width: 100%;
    height: 400px;
  `,
  section: css`
    margin-top: ${theme.spacing(4)};
  `
});

function renderHealth(message: string | undefined) {
  switch (message) {
    case "ok":
      return <Badge color="green" text="OK" icon="heart" />;

    default:
      return <Badge color="red" text="BAD" icon="bug" />;
  }
}
