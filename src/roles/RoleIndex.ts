import CreepRole from "roles/CreepRole";
import WorkerRole from "roles/WorkerRole";
import StructureSpawnRole from "./StructureSpawnRole";
import StructureControllerRole from "./StructureControllerRole";
import MuleRole from "./MuleRole";
import ScoutRole from "./ScoutRole";
import StructureTowerRole from "./StructureTowerRole";

export default class RoleIndex
{
	private roleData: any;
	roleNames: string[];
	constructor()
	{
		this.roleData =
		{
			Worker: new WorkerRole(),
			Mule: new MuleRole(),
			Scout: new ScoutRole(),
			StructureSpawn: new StructureSpawnRole(),
			StructureController: new StructureControllerRole(),
			StructureTower: new StructureTowerRole(),
		};
		this.roleNames = Object.keys(this.roleData);
	}

	getRole(param: string | JobAssignable): CreepRole
	{
		let role: string;
		if(typeof(param) === "string"){role = param;}
		else
		{
			const structureType: string | undefined = (param as any).structureType;
			switch(structureType)
			{
				case undefined:
					role = (param).memory.role;
					break;
				default:
					throw new Error(`Tried to query unknown role ${param.name}`);
				case STRUCTURE_SPAWN:
					role = "StructureSpawn";
					break;
				case STRUCTURE_CONTROLLER:
					role = "StructureController"
					break;
				case STRUCTURE_TOWER:
					role = "StructureTower"
					break;
			}

		}
		return this.roleData[role] as CreepRole;
	}
}