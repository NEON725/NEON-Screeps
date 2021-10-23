import CreepRole from "types/CreepRole";
import WorkerRole from "roles/worker";

export default class RoleIndex
{
	private roleData:any;
	constructor()
	{
		this.roleData =
		{
			worker:new WorkerRole(),
		};
	}
	getRole(role:string): CreepRole
	{
		return this.roleData[role] as CreepRole;
	}
}