import React, { useMemo } from "react";
import { SceneApp, SceneAppPage } from "@grafana/scenes";
import { prefixRoute } from "utils/utils.routing";
import { ROUTES } from "../../constants";
import { getAdvancedLLMIntegrationScene, getBasicLLMIntegrationScene } from "./scenes";

const getLLMAppScene = () => {
    return new SceneApp({
        pages: [
            new SceneAppPage({
                title: 'Page with large language model integration',
                subTitle: 'This page showcases basic LLM integration within a scenes app',
                url: prefixRoute(`${ROUTES.WithLLM}`),
                getScene: getBasicLLMIntegrationScene,
                tabs: [
                    new SceneAppPage({
                        title: 'Basic LLM Integration',
                        url: prefixRoute(`${ROUTES.WithLLM}/basic`),
                        getScene: getBasicLLMIntegrationScene,
                    }),
                    new SceneAppPage({
                        title: 'Advanced LLM Integration',
                        url: prefixRoute(`${ROUTES.WithLLM}/advanced`),
                        getScene: getAdvancedLLMIntegrationScene,
                    }),
                ],
            })
        ]
    })
}

export const WithLLM = () => {
  const scene = useMemo(() => getLLMAppScene(), []);

  return <scene.Component model={scene} />;
};