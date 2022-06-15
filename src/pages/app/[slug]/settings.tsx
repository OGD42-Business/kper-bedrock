import Link from "next/link";
import { useRouter } from "next/router";
import UpgradeButton from "../../../client/components/UpgradeButton";
import {
  GetProjectWithUsersQueryVariables,
  useGetProjectWithUsersQuery,
} from "../../../client/graphql/getProjectWithUsers.generated";
import { useCreateStripeCheckoutBillingPortalUrlMutation } from "../../../client/graphql/createStripeCheckoutBillingPortalUrl.generated";

import { useState } from "react";
import { useInviteToProjectMutation } from "../../../client/graphql/inviteToProject.generated";
import toast from "react-hot-toast";
import { useRemoveUserFromProjectMutation } from "../../../client/graphql/removeUserFromProject.generated";
import { useGetCurrentUserQuery } from "../../../client/graphql/getCurrentUser.generated";

function InvitationForm({ projectId }: { projectId: string }) {
  const [email, setEmail] = useState("");
  const [, inviteToProject] = useInviteToProjectMutation();

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        toast
          .promise(
            inviteToProject({
              projectId,
              email,
            }),
            {
              loading: `Inviting ${email}...`,
              success: `Invited ${email}!`,
              error: (err) => err,
            }
          )
          .then(() => {
            setEmail("");
          });
      }}
    >
      <input
        type="email"
        placeholder="colleague@company.com"
        value={email}
        onChange={(evt) => setEmail(evt.target.value)}
      />
      <button type="submit" disabled={email.length === 0}>
        Invite
      </button>
    </form>
  );
}

function ProjectSettings() {
  const { isReady, query } = useRouter();
  const { slug } = query;
  const [{ data: currentUserData }] = useGetCurrentUserQuery();

  const [variables, setVariables] = useState<GetProjectWithUsersQueryVariables>(
    { usersFirst: 10 }
  );
  const [{ data, fetching, error }] = useGetProjectWithUsersQuery({
    pause: !isReady,
    variables: { ...variables, slug: String(slug) },
  });

  const hasBeenFetchedOnce = Boolean(data || error);
  const initialFetching = fetching && !hasBeenFetchedOnce;
  const additionalFetching = fetching && hasBeenFetchedOnce;

  const [, createStripeCheckoutBillingPortalUrl] =
    useCreateStripeCheckoutBillingPortalUrlMutation();

  const [, removeUserFromProject] = useRemoveUserFromProjectMutation();

  if (!isReady || initialFetching) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;
  if (!data?.project) return <p>Not found.</p>;
  if (!currentUserData?.currentUser) return null;

  const { currentUser } = currentUserData;
  const { project } = data;
  const { users } = project;

  const pageInfo = users?.pageInfo;
  const endCursor = pageInfo?.endCursor;
  const hasNextPage = Boolean(pageInfo?.hasNextPage);

  return (
    <>
      <h1>{project.name} Settings</h1>
      <h2>Users</h2>
      <ul>
        {users?.edges?.map((edge) => {
          const user = edge?.node;
          if (!user) return null;
          return (
            <li key={user.id}>
              {user.name || user.email}{" "}
              {user.id !== currentUser.id && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to remove ${user.email} from ${
                          project.name || "this project"
                        }?`
                      )
                    ) {
                      toast.promise(
                        removeUserFromProject({
                          projectId: project.id,
                          userId: user.id,
                        }),
                        {
                          loading: `Removing ${user.email}...`,
                          success: `Removed ${user.email}!`,
                          error: (err) => err,
                        }
                      );
                    }
                  }}
                >
                  ｘ
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {hasNextPage && (
        <button
          disabled={additionalFetching}
          onClick={() => {
            setVariables((prevVariables) => ({
              ...prevVariables,
              usersAfter: endCursor,
            }));
          }}
        >
          {additionalFetching ? "Fetching..." : "Load more users"}
        </button>
      )}
      <InvitationForm projectId={project.id} />
      {!project.paidPlan ? (
        <UpgradeButton projectId={project.id} />
      ) : (
        <button
          onClick={() => {
            createStripeCheckoutBillingPortalUrl({
              projectId: project.id,
            }).then((result) => {
              const url = result.data?.createStripeCheckoutBillingPortalUrl;
              if (url) window.location.href = url;
            });
          }}
        >
          Manage billing
        </button>
      )}
      <Link href={`/app/${project.slug}`}>Back to project dashboard</Link>
    </>
  );
}

export default ProjectSettings;
