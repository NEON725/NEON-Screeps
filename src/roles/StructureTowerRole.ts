import JobBase from "jobs/JobBase";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "./CreepRole";

export default class StructureTowerRole extends CreepRole
{
	constructor()
	{
		super("StructureTower");
	}

	initMemory(): CreepMemory
	{
		return new CreepMemoryBase(this.roleName);
	}

	run(creep: Creep | Structure<StructureConstant>): void
	{
		const enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if(enemy)
		{
			const tower = creep as StructureTower;
			tower.attack(enemy);
		}
	}

	canAcceptJob(creep: JobAssignable, job: JobBase): boolean
	{
		return false;
	}

	generateBody(energyBudget: number): BodyPartConstant[]
	{
		throw new Error("Method not implemented.");
	}

}