import JobBase from "jobs/JobBase";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "types/CreepRole";

export default class StructureControllerRole extends CreepRole
{
	constructor()
	{
		super("StructureController");
	}

	initMemory(): CreepMemory
	{
		return new CreepMemoryBase(this.roleName);
	}

	canAcceptJob(creep: JobAssignable, job: JobBase): boolean
	{
		return false;
	}

}