# Build a scatterplot plugin in Grafana 7.0

Grafana 7.0 introduced a new React-based plugin platform, with a set of new APIs and design system to help you build your own plugin. Each panel is now a React component, which means that plugin developers can reuse components from other projects in the React ecosystem.

In this blog post, I'll show how you can create a panel plugin for visualizing scatterplots. This post assumes that you have basic knowledge of [ReactJS](https://reactjs.org/docs/getting-started.html#learn-react) and [TypeScript](https://www.typescriptlang.org/) (or Javascript).

If you feel

## What's a scatterplot?

A scatterplot is a type of graph that display values for (usually) two variables as a set of points along a horizontal and vertical axis. Scatterplots are useful for identifying relationships between, for example, a country's GDP and it's life expectancy.

By the end of this tutorial, you'll have built a scatterplot that looks like this:

![Scatterplot](./image)

## Create a panel plugin for Grafana

The easiest way to get started with building plugins for Grafana is to use the [grafana-toolkit](https://www.npmjs.com/package/@grafana/toolkit/)—a command-line application for speeding up plugin development for Grafana.

1. If you have [NPM](https://www.npmjs.com/get-npm/) installed on your machine, you can install the toolkit by running the following command in your terminal of choice:

   ```
   npx @grafana/toolkit plugin:create scatterplot
   ```

1. In the prompt, select **Panel Plugin** to create a plugin from one of our templates.

1. Next, navigate to the new directory, install the dependencies, and build the plugin.

   ```
   cd scatterplot
   yarn install
   yarn dev
   ```

Next, you need to tell Grafana where to find your plugin. If you already have Grafana installed on your machine, you can configure the [path to your plugin directory](https://grafana.com/docs/grafana/latest/installation/configuration/#plugins) containing your plugin in the Grafana configuration file, but in this example, we’ll use Docker:

1. Start Grafana using Docker, with the directory containing your plugin mounted on `var/lib/grafana/plugin` inside the container.

   ```
   docker run -d -p 3000:3000 -v $HOME/grafana-plugins:/var/lib/grafana/plugins --name=grafana grafana/grafana:7.0.0
   ```

1. Browse to http://localhost:3000, log in, and create a new dashboard.
1. Add a new panel and select the scatterplot plugin from the list of Visualizations.



## Draw the scatterplot

The starter plugin immediately gets you set up for plugin development, so that you can get right into visualizing the scatterplot.

There are countless libraries and frameworks out there for creating charts, and visualizing data in a web browser, all of them with their own strengths. Grafana doesn't mandate which one you use, but gives you the freedom to choose the one that makes sense to you.

In this blog post, we’re going to use SVG and [D3.js](https://d3js.org/), a popular combination for creating interactive visualizations for web browsers.

You can find the React component that creates the visualization in `SimplePanel.tsx` in the `src` directory. There's already some code provided to you by the plugin template, but we're going to start afresh.

1. Clean up the function so that it only returns an `svg` tag with the width and height of the panel.

   ```ts
   export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
     return (
       <svg width={width} height={height}></svg>
     );
   };
   ```

1. Add a circle in the inside the `svg` tag.

   ```ts
   export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
     return (
       <svg width={width} height={height}>
         <circle cx={width / 2} cy={height / 2} r={5} />
       </svg>
     );
   };
   ```

1. Build the plugin again, and reload your browser to see the new changes. You may have to save your dashboard unless you haven't done so already.

### Draw circles using D3.js

A circle is nice and all, but we want to visualize more than that, and without having to set the coordinates ourselves.

D3.js is widely popular library for creating _data-driven documents_. While it's technically not a charting library, it's commonly used for programmatically generating SVG charts.

Grafana bundles the D3 dependency and makes it available to your plugin when it's loaded, but we need to install the TypeScript types for development.

```
yarn add --dev @types/d3
```

We also need to import D3 in our `SimplePanel.tsx`.

```ts
import * as d3 from 'd3';
```

The easiest way to draw large amounts of data dynamically using D3, is by using [d3-scales](). A scale is a function that maps one range of values to another. In this case, we want to map the values in our first field to a position in pixels.

1. Add a D3 scale for the horizontal axis, that maps a value between 0 and 100 to a coordinate within the panel canvas.

   ```ts
   const xScale = d3
       .scaleLinear()
       .domain([0, 100])
       .range([0, width]);
   ```

1. Add another scale for the vertical axis. Note that the range goes from `height` to `0`. This inverts the scale so that `0` starts at the bottom.

   ```ts
     const yScale = d3
       .scaleLinear()
       .domain([0, 100)
       .range([height, 0]);
   ```

Now that we have our scales set up, let's use them to calculate the x and y positions of the points.

1. Generate a few data points that we can visualize.

   ```ts
     let points: any = [];
     for (let i = 0; i < 100; i++) {
       points.push({ x: i * Math.random(), y: i * Math.random() });
     }
   ```

1. Generate `circle` tags from the point data, and put them inside a SVG group, `g`.

   ```ts
     return (
       <svg width={width} height={height}>
         <g>
           {points.map((point: any) => (
             <circle cx={xScale(point.x)} cy={yScale(point.y)} r={5} />
           ))}
         </g>
       </svg>
     );
   ```

1. Rebuild your plugin and reload the browser to update the panel.

> Pro tip: If you want to avoid having to run `yarn dev` after each change, you can instead run `yarn watch` to rebuild the plugin whenever the code changes. Just reload the browser after saving your code.

If you already have some experience with D3, the code above might not be what you're used to. Since both D3 and React wants to update the DOM, we need to set some boundaries so that they don't step on each other's toes.

Several approaches have emerged that try to address this. Here, I'm using D3 only for data transformations, and React for rendering the elements. If you prefer to use D3 for rendering elements as well, the [React + D3.js](https://wattenberger.com/blog/react-and-d3/) guide explains how to use the `useEffect` hook to accomplish this.

### Draw axes

Next, let's add a horizontal and vertical axis to describe the points.

D3 provides helper functions to generate axes for charts.

1. Create a horizontal and a vertical axis, using the scales we created earlier.

   ```ts
   const xAxis = d3.axisBottom(xScale);
   const yAxis = d3.axisLeft(yScale);
   ```

1. Generate the elements for the axis, by passing an anonymous function as a `ref` to a `g` element.

   ```ts
   <g
     ref={node => {
       d3.select(node).call(yAxis as any);
     }}
   />
   ```

### Transforming SVG elements

Unfortunately, if you added the two axes to your graph, they probably didn't end up where you expected them to.

Let's address the vertical axis first. Even though the line is visible, the number are not. We can solve this by adding some margins to the chart.

1. Define chart margins.

   ```ts
   const margin = { left: 30, top: 30, right: 30, bottom: 30 };
   ```

1. Calculate dimensions for the inner chart.

   ```ts
   const chartWidth = width - (margin.left + margin.right);
   const chartHeight = height - (margin.top + margin.bottom);
   ```

1. Add margins by surrounding the points and axes with another `g` tag, this time with a `transform` attribute to translate the elements inside.

   ```ts
   <svg width={width} height={height}>
     <g transform={`translate(${margin.left}, ${margin.top})`}>
       ...
     </g>
   </svg>
   ```

1. Update the scales to use the inner chart dimensions.

```ts
const xScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, chartWidth]);

const yScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([chartHeight, 0]);
```

Finally, let's translate the horizontal axis to the bottom of the chart.

```ts
<g
  transform={`translate(0, ${chartHeight})`}
  ref={node => {
    d3.select(node).call(xAxis as any);
  }}
/>
```

In this blog post I showed how to create a scatterplot visualization for Grafana by building a panel plugin. Obviously, there's more we need to do before this plugin is ready for prime time.

We'll continue to improve our scatterplot in the next blog post, by using the data returned from one of our data sources, as well as making the panel configurable by users.

If you want to learn more, check out our tutorial on how to [Build a panel plugin](https://grafana.com/tutorials/build-a-panel-plugin). Once your ready to take the next step, check out some of our more advanced guides on plugin development, by heading to [Build a plugin](https://grafana.com/docs/grafana/latest/developers/plugins/).
