import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "types/CreepRole";

export class WorkerMemory extends CreepMemoryBase
{
	harvesting=true;
}

export default class WorkerRole extends CreepRole
{
	constructor()
	{
		super("worker");
	}
	initMemory():CreepMemory
	{
		return new WorkerMemory(this.roleName);
	}
	run(creep: Creep):void
	{
		super.run(creep);
		const memory = creep.memory as WorkerMemory;
		const carry = creep.store;
		if(memory.harvesting)
		{
			if(carry.getFreeCapacity() === 0) { memory.harvesting = false; }
			else
			{
				const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
				if(source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
				{
					creep.moveTo(source);
				}
			}
		}
		else if(carry.energy === 0){memory.harvesting = true;}
		else
		{
			const spawn = Game.spawns.Spawn1;
			if(spawn !== null && creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
			{
				creep.moveTo(spawn);
			}
		}
	}
}