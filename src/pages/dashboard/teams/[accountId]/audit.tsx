import { useRouter } from "next/router";
import useTeamAccount from "@/utils/api/use-team-account";
import useAudit from "@/utils/api/use-audit";
import useTranslation from "next-translate/useTranslation";
import DashboardMeta from "@/components/dashboard/dashboard-meta";
import {Button} from "react-daisyui";
import DashboardContent from "@/components/dashboard/shared/dashboard-content";
import useTeamMembers from "@/utils/api/use-team-members";
import {useState} from "react";

const ALL_OPERATIONS = 'ALL'
const ALL_USERS = 'ALL_USERS'

const tableMap = {
  accounts: "teamAccountAudit.entities.accounts",
  account_user: "teamAccountAudit.entities.user",
  invitations: "teamAccountAudit.entities.invitation",
}

const operationMap = {
  INSERT: "teamAccountAudit.operations.create",
  UPDATE: "teamAccountAudit.operations.update",
  DELETE: "teamAccountAudit.operations.delete",
}

const TeamAudit = () => {
  const router = useRouter();
  const { accountId } = router.query;
  const [filterOperation, setFilterFilterOperation] = useState<string | null>(null)
  const [filterUserId, setFilterUserId] = useState<string | null>(null)
  const { data: teamAccount } = useTeamAccount(accountId as string);
  const { data: auditLog } = useAudit(accountId as string, filterOperation === ALL_OPERATIONS ? undefined : filterOperation);
  const { data: teamMembers } = useTeamMembers(accountId as string);
  const { t } = useTranslation("dashboard");

  return (
    <>
      <DashboardMeta
        title={t("dashboardMeta.teamDashboard", { teamName: teamAccount?.team_name })}
      />
      <DashboardContent>
        <DashboardContent.Title>
          {t("teamAccountAudit.pageTitle")}
        </DashboardContent.Title>
        <DashboardContent.Content>
          <div className="flex flex-col w-full lg:flex-row">
            <div className="grid flex-growform-control w-full max-w-xs mr-8">
              <label className="label">
                <span className="label-text">Entity id</span>
              </label>
              <input type="text" placeholder="Enter entity id..." className="input input-bordered input-xs w-full max-w-xs"/>
            </div>
            <div className="grid flex-growform-control w-full max-w-xs mr-8">
              <label className="label">
                <span className="label-text">Operation</span>
              </label>
              <select value={filterOperation} onChange={(e) => setFilterFilterOperation(e.target.value)} className="select select-bordered select-xs">
                <option value={ALL_OPERATIONS}>All</option>
                {(Object.entries(operationMap)).map(([key, value]) => {
                  return <option key={key} value={key}>{t(value)}</option>
                })}
              </select>
            </div>
            <div className="grid flex-growform-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">User</span>
              </label>
              <select value={filterUserId} className="select select-bordered select-xs">
                <option value={ALL_USERS}>All</option>
                {(teamMembers || []).map((member, index) => {
                  return <option key={index} value={member.user_id}>{member.name}</option>
                })}
              </select>
            </div>
          </div>
          <div className="divider"></div>

          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
              <tr>
                <th></th>
                <th>Entity</th>
                <th>Entity Id</th>
                <th>Operation</th>
                <th>Occurred at</th>
                <th>Diff</th>
              </tr>
              </thead>
              <tbody>
              {
                (auditLog || []).map((audit, index) => {
                  const entityType = t(tableMap[audit.table_name as string || 'teamAccountAudit.unknown'])
                  const operation = t(operationMap[audit.op ||  'teamAccountAudit.unknown'])

                  return (
                    <tr key={index}>
                      <th>{index}</th>
                      <td>{entityType}</td>
                      <td>{audit.record_id || audit.old_record_id}</td>
                      <td>{operation}</td>
                      <td>{(new Date(audit.ts as string)).toLocaleDateString()}</td>
                      <td><Button size={'xs'}>Details</Button></td>
                    </tr>
                  )
                })
              }

              </tbody>
              <tfoot>
              <tr>
                <th></th>
                <th>Entity</th>
                <th>Entity Id</th>
                <th>Operation</th>
                <th>Occurred at</th>
                <th>Diff</th>
              </tr>
              </tfoot>
            </table>
          </div>
          <div className="divider"></div>
          <div
            className="flex max-w-4xl flex-wrap items-center justify-center gap-2 overflow-x-hidden undefined"
          >
            <div className="btn-group grid grid-cols-2">
              <button className="btn btn-outline">Previous page</button>
              <button className="btn btn-outline">Next</button>
            </div>
          </div>
        </DashboardContent.Content>
      </DashboardContent>
    </>
  );
};

export default TeamAudit;
