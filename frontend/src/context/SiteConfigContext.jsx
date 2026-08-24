import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultSiteConfig,
  fetchSiteConfig,
} from "../services/siteConfigService";

const SiteConfigContext = createContext({
  config: defaultSiteConfig(),
  loading: true,
  refresh: async () => {},
});

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultSiteConfig());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchSiteConfig();
      setConfig(next);
    } catch {
      setConfig(defaultSiteConfig());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ config, loading, refresh }),
    [config, loading, refresh]
  );

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
