import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NavModelItem } from '@grafana/data';
import { usePluginProps } from './utils.plugin';
import { NAVIGATION, NAVIGATION_TITLE, NAVIGATION_SUBTITLE, PLUGIN_BASE_URL } from '../constants';

export function usePageNav(): NavModelItem | undefined {
  const pluginProps = usePluginProps();
  const location = useLocation();
  const [pageNav, setPageNav] = useState<NavModelItem | undefined>();

  useEffect(() => {
    if (!pluginProps) {
      console.error('Root plugin props are not available in the context.');
      setPageNav(undefined);
      return;
    }

    const activeId = Object.keys(NAVIGATION).find((routeId) => location.pathname.includes(routeId)) || '';

    setPageNav({
      text: NAVIGATION_TITLE,
      subTitle: NAVIGATION_SUBTITLE,
      url: pluginProps.basename,
      img: pluginProps.meta.info.logos.large,
      children: Object.values(NAVIGATION).map((navItem) => ({
        ...navItem,
        active: navItem.id === activeId,
      })),
    });
  }, [location.pathname, pluginProps]);

  return pageNav;
}

// Prefixes the route with the base URL of the plugin
export function prefixRoute(route: string): string {
  return `${PLUGIN_BASE_URL}/${route}`;
}
