import FillSpawnerJob from "jobs/FillSpawnerJob";
import JobBase from "jobs/JobBase";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "types/CreepRole";
import {randomDirection} from "utils/misc";

export class WorkerMemory extends CreepMemoryBase
{
	harvesting = true;
}

export default class WorkerRole extends CreepRole
{
	constructor()
	{
		super("worker");
	}

	initMemory(): CreepMemory
	{
		return new WorkerMemory(this.roleName);
	}

	run(creep: Creep): void
	{
		super.run(creep);
		const memory = creep.memory as WorkerMemory;
		const jobId = memory.assignedJob;
		const carry = creep.store;
		if(memory.harvesting)
		{
			const job = global.jobQueue.getJobById(jobId);
			if(job){job.unassignJob(creep);}
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
			const job = global.jobQueue.getJobById(jobId);
			switch(job?.jobName)
			{
				case "FillSpawner":
				{
					const fillJob = job as FillSpawnerJob;
					const spawn = Game.getObjectById(fillJob.spawnId) as StructureSpawn;
					const result = creep.transfer(spawn, RESOURCE_ENERGY);
					switch(result)
					{
						case ERR_NOT_IN_RANGE:
						{
							creep.moveTo(spawn);
							break;
						}
						case ERR_FULL:
						case ERR_INVALID_TARGET:
						{
							if(carry.getFreeCapacity() > 0){memory.harvesting = true;}
							job.unassignJob(creep);
							break;
						}
						case OK:
							break;
						default:
							throw new Error(`Unknown result: ${result}`);
					}
					if(result === ERR_NOT_IN_RANGE){creep.moveTo(spawn);}
					break;
				}
				default:
					creep.move(randomDirection());
					break;
			}
		}
	}

	canAcceptJob(creep: Creep, job: JobBase): boolean
	{
		return job.jobName === "FillSpawner" && !(creep.memory as WorkerMemory).harvesting;
	}
}