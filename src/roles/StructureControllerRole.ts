import JobBase from "jobs/JobBase";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "roles/CreepRole";

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

	run(structure: Structure): void
	{
	}

	generateBody(unused: number): BodyPartConstant[]
	{
		throw new Error("Cannot generate body specifications for structure.");
	}
}