import { Toaster } from "react-hot-toast";
import type { AppProps } from "next/app";
import { Provider } from "urql";
import { client } from "../client/graphql/client";
import Layout from "../client/components/Layout";

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <Layout>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </Layout>
    </Provider>
  );
}

export default CustomApp;
