import Link from "next/link";
import { useGetCurrentUserQuery } from "../client/graphql/getCurrentUser.generated";

function Homepage() {
  const [{ data }] = useGetCurrentUserQuery();

  return (
    <>
      <h1>My SaaS Name</h1>
      <h2>This could be your tagline</h2>
      {!data?.currentUser ? (
        <>
          <Link href="/get-started">Get started</Link>
          <Link href="/login">Login</Link>
        </>
      ) : (
        <Link href="/app">Go to dashboard</Link>
      )}
    </>
  );
}

export default Homepage;
